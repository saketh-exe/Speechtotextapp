import { ScrollView, Text, View, TouchableOpacity, Animated, Easing, NativeSyntheticEvent, NativeScrollEvent, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { useAudioRecorder, useAudioPlayer, useAudioPlayerStatus, AudioModule, RecordingPresets } from 'expo-audio';
import { makeStyles } from '../styles/HomeStyles';
import { useNavBar } from '@/context/NavContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Directory,Paths, File as ExpoFile} from 'expo-file-system';

const BACKEND_URL = 'http://10.29.114.1:3000/api/speech-to-text/';
const STORAGE_KEY = 'AUDIO_AND_TRANSCRIPTIONS';
export default function HomeScreen() {
  const { setIsScrolled } = useNavBar();
  const { palette } = useAppTheme();
  const S = makeStyles(palette);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAvRecording, setIsAvRecording] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolled(e.nativeEvent.contentOffset.y > 60);
  };

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const audioPlayer = useAudioPlayer(undefined, { updateInterval: 100 });
  const playerStatus = useAudioPlayerStatus(audioPlayer);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAvRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isAvRecording, pulseAnim]);

  useEffect(() => {
    fetch(BACKEND_URL.replace('/api/speech-to-text/', '/'))
      .then((res) => res.text())
      .then((text) => console.log("ntg"))
      .catch((err) => console.error('Backend ping failed:', err));
  }, []);

  useEffect(() => {
    if (playerStatus.didJustFinish) {
      audioPlayer.seekTo(0);
      audioPlayer.pause();
    }
  }, [playerStatus.didJustFinish, audioPlayer]);

  const handleAvStart = async () => {
    try {
      setError('');
      setTranscript('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        setError('Microphone permission denied.');
        return;
      }

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsAvRecording(true);
    } catch {
      setError('Could not start audio recording.');
    }
  };

  const handleAvStop = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsAvRecording(false);
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) throw new Error('No URI after recording');
      audioPlayer.replace({ uri });
      
      // Auto-send to backend
      handleSendToBackend(uri);
    } catch {
      setError('Could not stop recording.');
    }
  };

  const handleSendToBackend = async (uri: string) => {
    if (!uri) return;
    const controller = new AbortController();
    // Allow up to 5 minutes — long recordings take time to transcribe on CPU
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);
    try {
      setIsLoading(true);
      audioPlayer.pause();
      const formData = new FormData();
      
      let webBlob: Blob | null = null;
      if (Platform.OS === 'web') {
        const audioResponse = await fetch(uri);
        webBlob = await audioResponse.blob();
        const file = new File([webBlob], 'recording.m4a', { type: webBlob.type || 'audio/m4a' });
        formData.append('audio', file);
      } else {
        formData.append('audio', {
          uri: uri,
          name: 'recording.m4a',
          type: 'audio/m4a',
        } as any);
      }

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`Server error ${response.status}${errBody ? ': ' + errBody : ''}`);
      }
      const data = await response.json();
      setTranscript(data.transcript ?? 'No transcription returned.');

      /*
        ***********************
        Storage Logic
        ***********************

      */
      let prev = await AsyncStorage.getItem(STORAGE_KEY);
      if (prev == null) prev = '[]';
      let temp = JSON.parse(prev);
      const fileNameId = `recording_${Date.now()}`;

      if (Platform.OS !== 'web') {
        const directory = new Directory(Paths.document, "Recordings");
        if(directory.exists === false) directory.create()

        const fileName = `${fileNameId}.m4a`;

        const destination = new ExpoFile(directory, fileName);
       
        const source = new ExpoFile(uri)
        source.copy(destination)

        temp.push({ uri: destination.uri, transcript: data.transcript });
      } else if (webBlob) {
        // Save the actual blob in IndexedDB for web
        const localforage = require('localforage');
        const idbKey = `web_audio_${fileNameId}`;
        await localforage.setItem(idbKey, webBlob);
        
        // Save the indexedDB key as a custom scheme URI marker
        temp.push({ uri: `idb://${idbKey}`, transcript: data.transcript });
      }

      /*
      *************************
      Storage Logic Ends
      *************************
      */
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(temp));
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setError('Transcription timed out. Try a shorter recording.');
      } else {
        console.error('Transcription error:', err);
        setError(`Transcription failed: ${err?.message ?? 'Unknown error'}`);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={S.safeAreaView}>
      <ScrollView
        contentContainerStyle={S.mainScrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={S.recordContainer}>
          {!isAvRecording && (
            <TouchableOpacity
              style={[S.recordButton, S.avButton]}
              onPress={handleAvStart}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <IconSymbol name="mic.fill" size={68} color={palette.background} />
            </TouchableOpacity>
          )}

          {isAvRecording && (
            <View style={S.pulseContainer}>
              <Animated.View
                style={[
                  S.pulseRing,
                  {
                    transform: [
                      { scale: pulseAnim },
                      {
                        rotate: pulseAnim.interpolate({
                          inputRange: [0, 1.4],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <TouchableOpacity
                style={[S.recordButton, { backgroundColor: palette.record, zIndex: 1 }]}
                onPress={handleAvStop}
                activeOpacity={0.8}
              >
                <IconSymbol name="mic.fill" size={62} color={palette.background} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {error ? <Text style={S.errorText}>{error}</Text> : null}

        <View style={S.transcriptionContainer}>
          <Text style={[S.transcriptionTitle, S.iconColor]}>
            Transcription{isLoading ? ' (processing...)' : ''}
          </Text>
          <ScrollView>
            <Text style={[S.transcriptionText, S.textColor]}>
              {transcript || 'Your transcribed text will appear here after you record audio.'}
            </Text>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
