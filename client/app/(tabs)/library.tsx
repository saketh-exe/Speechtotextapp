import { View, Text, ScrollView, NativeSyntheticEvent, NativeScrollEvent, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeStyles } from '../styles/HomeStyles';
import { useNavBar } from '@/context/NavContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState, useEffect, useRef } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useFocusEffect } from '@react-navigation/native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { File } from 'expo-file-system';
import { M3ProgressBar } from '@/components/ui/M3ProgressBar';
import { Platform } from 'react-native';

const STORAGE_KEY = 'AUDIO_AND_TRANSCRIPTIONS';

type LibraryEntry = {
  uri: string;
  transcript: string;
};


export default function LibraryScreen() {
  const { setIsScrolled } = useNavBar();
  const [items, setItems] = useState<LibraryEntry[]>([]);
  const [error, setError] = useState('');
  const { palette } = useAppTheme();
  const S = makeStyles(palette);
  const audioPlayer = useAudioPlayer(undefined, { updateInterval: 100 });
  const status = useAudioPlayerStatus(audioPlayer);
  const [currentPlayingUri, setCurrentPlayingUri] = useState<string | null>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolled(e.nativeEvent.contentOffset.y > 60);
  };

  // Auto-refresh when tab is focused
  useFocusEffect(
    useCallback(() => {
      loadEntriesManual();
    }, [])
  );

  // Auto-reset when playing finishes
  useEffect(() => {
    if (status.didJustFinish) {
      setCurrentPlayingUri(null);
      audioPlayer.seekTo(0);
      audioPlayer.pause();
    }
  }, [status.didJustFinish]);

  const loadEntriesManual = useCallback(async () => {
    try {
      setError('');
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setItems([]);
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setError('Stored data format is invalid.');
        setItems([]);
        return;
      }

      const safeItems: LibraryEntry[] = parsed
        .filter((item: any) => item && typeof item.uri === 'string' && typeof item.transcript === 'string')
        .map((item: any) => ({ uri: item.uri, transcript: item.transcript }));

      setItems(safeItems.reverse());
    } catch {
      setError('Failed to read saved transcriptions.');
      setItems([]);
    }
  }, []);

  const persistAndUpdate = async (nextItems: LibraryEntry[], deletedItem: LibraryEntry) => {
    console.log(nextItems)
    console.log('Deleted item:', deletedItem.uri)
    
    if (Platform.OS === 'web' && deletedItem.uri.startsWith('idb://')) {
      const localforage = require('localforage');
      const idbKey = deletedItem.uri.replace('idb://', '');
      await localforage.removeItem(idbKey);
    } else if (Platform.OS !== 'web') {
      try {
        const file = new File(deletedItem.uri);
        file.delete();
      } catch (e) {
        console.warn("Failed to delete native file", e);
      }
    }
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    setItems(nextItems.slice().reverse());
  };

  const handleDelete = (displayIndex: number) => {
    Alert.alert("Delete Item", "Remove this saved transcription?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const deletedItem = items[displayIndex]
          const updated = items.filter((_, idx) => idx !== displayIndex).reverse();
  
          await persistAndUpdate(updated, deletedItem);
        },
      },
    ]);
  };

  const handlePlayback = async (uri: string) => {
    try {
      if (currentPlayingUri === uri && status.playing) {
        // Pause current
        audioPlayer.pause();
      } else if (currentPlayingUri === uri) {
        // Resume
        audioPlayer.play();
      } else {
        // Play different
        let playUri = uri;
        
        // Handle web IndexedDB URIs
        if (Platform.OS === 'web' && uri.startsWith('idb://')) {
          const localforage = require('localforage');
          const idbKey = uri.replace('idb://', '');
          const blob: Blob | null = await localforage.getItem(idbKey);
          
          if (!blob) throw new Error('Audio file missing from local storage');
          // Create temporary object URL for playback
          playUri = URL.createObjectURL(blob);
        }

        audioPlayer.replace({ uri: playUri });
        await audioPlayer.play();
        setCurrentPlayingUri(uri);
      }
    } catch (err) {
      setError(`Failed to play audio: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <SafeAreaView style={S.safeAreaView}>
      <View style={{ alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, zIndex: 10 }}>
        <Text style={[S.transcriptionTitle, S.iconColor]}>
          Library
        </Text>
        <Text style={[S.transcriptionText, S.textColor, { marginTop: 4 }]}>
          Saved recordings and transcriptions
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={[S.mainScrollContainer, { paddingTop: 10, justifyContent: 'flex-start' }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={{ alignItems: 'stretch' }}>
          {error ? <Text style={S.errorText}>{error}</Text> : null}

          {!items.length ? (
            <Text style={[S.textMuted, { marginTop: 12 }]}>No saved entries yet.</Text>
          ) : (
            <View style={{ width: '100%', gap: 16, marginTop: 8, paddingBottom: 20 }}>
              {items.map((item, index) => {
                const isItemPlaying = currentPlayingUri === item.uri && status.playing;
                const isItemActive = currentPlayingUri === item.uri;
                const playbackProgress = status.duration > 0 ? status.currentTime / status.duration : 0;
                
                // M3 style waveform bars - animate or just random statical heights per card

                return (
                <View key={`${item.uri}-${index}`} style={S.libraryCard}>
                  {/* Left Content Area */}
                  <View style={S.libraryCardContent}>
                    
                    <View style={S.libraryCardHeader}>
                      <View style={S.libraryCardTitleContainer}>
                        <IconSymbol name="mic.fill" size={18} color={palette.primary} style={{ marginRight: 8 }} />
                        <Text style={S.libraryCardTitle} numberOfLines={1}>
                          {item.uri.split('/').pop()?.split('.')[0] || `Recording ${index + 1}`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(index)}
                        activeOpacity={0.7}
                        style={{ padding: 4 }}
                      >
                        <IconSymbol name="trash.circle.fill" size={24} color={palette.danger} />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={S.libraryCardBody} numberOfLines={2}>
                      {item.transcript || '(No transcript)'}
                    </Text>

                    {/* Material 3 Linear Progress Indicator */}
                    <M3ProgressBar 
                      progress={isItemActive ? playbackProgress : 0} 
                      activeColor={palette.primary}
                      trackColor={palette.surfaceVariant}
                      isPlaying={isItemPlaying}
                    />
                  </View>

                  {/* Right Play Button Area */}
                  <View style={S.libraryCardRight}>
                    <TouchableOpacity
                      style={S.circularPlayButton}
                      onPress={() => handlePlayback(item.uri)}
                      activeOpacity={0.8}
                    >
                      <IconSymbol
                        name={isItemPlaying ? 'pause.fill' : 'play.fill'}
                        size={24}
                        color={palette.background}
                      />
                    </TouchableOpacity>
                  </View>

                </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
