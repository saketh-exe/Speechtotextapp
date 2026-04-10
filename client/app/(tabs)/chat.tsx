import {
  View,
  Text,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeStyles } from '../styles/HomeStyles';
import { useNavBar } from '@/context/NavContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LibraryCard } from '@/components/ui/LibraryCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Markdown from 'react-native-markdown-display';

const STORAGE_KEY = 'AUDIO_AND_TRANSCRIPTIONS';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  references?: any[];
};

export default function ChatScreen() {
  const { setIsScrolled } = useNavBar();
  const { palette } = useAppTheme();
  const S = makeStyles(palette);
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I am ready to help you with your transcriptions.', sender: 'bot' },
  ]);
  const [message, setMessage] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioPlayer = useAudioPlayer(undefined, { updateInterval: 100 });
  const status = useAudioPlayerStatus(audioPlayer);
  const [currentPlayingUri, setCurrentPlayingUri] = useState<string | null>(null);

  useEffect(() => {
    if (status.didJustFinish) {
      setCurrentPlayingUri(null);
      audioPlayer.seekTo(0);
      audioPlayer.pause();
    }
  }, [status.didJustFinish, audioPlayer]);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handlePlayback = async (uri: string) => {
    try {
      if (currentPlayingUri === uri && status.playing) {
        audioPlayer.pause();
      } else if (currentPlayingUri === uri) {
        audioPlayer.play();
      } else {
        let playUri = uri;
        if (Platform.OS === 'web' && uri.startsWith('idb://')) {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const localforage = require('localforage');
          const idbKey = uri.replace('idb://', '');
          const blob: Blob | null = await localforage.getItem(idbKey);
          if (!blob) throw new Error('Audio file missing from local storage');
          playUri = URL.createObjectURL(blob);
        }
        audioPlayer.replace({ uri: playUri });
        await audioPlayer.play();
        setCurrentPlayingUri(uri);
      }
    } catch (err) {
      Alert.alert('Error', `Failed to play audio: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolled(e.nativeEvent.contentOffset.y > 10);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userText = message.trim();
    const newUserMsg: Message = { id: Date.now().toString(), text: userText, sender: 'user' };

    setMessages(prev => [...prev, newUserMsg]);
    setMessage('');
    setIsLoading(true);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      let transcriptions: { id: string; transcript: string }[] = [];
      let allItems: any[] = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          allItems = parsed;
          transcriptions = parsed.map(item => {
            const fileName = item.uri.split('/').pop() || 'Unknown Audio';
            return {
              id: fileName,
              transcript: item.transcript,
            };
          });
        }
      }

      const response = await fetch('http://10.29.114.1:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, transcriptions }),
      });

      const data = await response.json();

      let responseText = data.message || 'No response';
      let msgReferences: any[] = [];

      const refSplit = responseText.split(/---\s*References:\s*/i);
      if (refSplit.length > 1) {
        responseText = refSplit[0].trim();
        const refsRaw = refSplit[1];

        const fileNames: string[] = [];
        const regex = /Audio\s*\[([^\]]+)\]/gi;
        let match;
        while ((match = regex.exec(refsRaw)) !== null) {
          fileNames.push(match[1]);
        }

        if (fileNames.length > 0) {
          msgReferences = allItems.filter(item => {
            const fName = item.uri.split('/').pop();
            return fName && fileNames.includes(fName);
          });
        }
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        references: msgReferences,
      };

      setMessages(prev => [...prev, botMsg]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 200);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[S.safeAreaView, { flex: 1, paddingBottom: 80 }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 20 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={S.title}>Chat</Text>
            <Text style={S.textMuted}>Ask questions about your notes</Text>
          </View>

          <View style={{ flex: 1, flexDirection: 'column', gap: 12 }}>
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              return (
                <View key={msg.id} style={{ alignItems: isUser ? 'flex-end' : 'flex-start', width: '100%' }}>
                  <View
                    style={{
                      backgroundColor: isUser ? palette.primary : palette.surfaceVariant,
                      maxWidth: '85%',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 20,
                      borderBottomRightRadius: isUser ? 4 : 20,
                      borderBottomLeftRadius: isUser ? 20 : 4,
                    }}
                  >
                    {!isUser ? (
                      <Markdown
                        style={{
                          body: { color: palette.text, fontSize: 16, lineHeight: 22 },
                          code_inline: { backgroundColor: palette.surface, color: palette.text, borderRadius: 4, padding: 2 },
                          code_block: { backgroundColor: palette.surface, color: palette.text, borderRadius: 8, padding: 8 },
                          link: { color: palette.primary },
                          bullet_list: { color: palette.text },
                          ordered_list: { color: palette.text },
                          table: { borderColor: palette.tabBarBorder },
                          tr: { borderColor: palette.tabBarBorder },
                          th: { borderColor: palette.tabBarBorder },
                          td: { borderColor: palette.tabBarBorder },
                        }}
                      >
                        {msg.text}
                      </Markdown>
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontSize: 16, lineHeight: 22 }}>
                        {msg.text}
                      </Text>
                    )}
                  </View>

                  {!isUser && msg.references && msg.references.length > 0 && (
                    <View style={{ marginTop: 8, width: '100%' }}>
                      <Text style={{ fontSize: 12, color: palette.textMuted, marginBottom: 4, marginLeft: 4 }}>
                        Sources:
                      </Text>
                      {msg.references.map((item, idx) => {
                        const isItemPlaying = currentPlayingUri === item.uri && status.playing;
                        const isItemActive = currentPlayingUri === item.uri;
                        const playbackProgress = status.duration > 0 ? status.currentTime / status.duration : 0;

                        return (
                          <View key={`ref-${msg.id}-${idx}`} style={{ marginBottom: 8, maxWidth: '90%' }}>
                            <LibraryCard
                              item={item}
                              index={idx}
                              palette={palette}
                              S={S}
                              isItemPlaying={isItemPlaying}
                              isItemActive={isItemActive}
                              playbackProgress={playbackProgress}
                              handlePlayback={handlePlayback}
                              hideDelete={true}
                            />
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
            
            {isLoading && (
              <View style={{ alignItems: 'flex-start', width: '100%', marginTop: 8 }}>
                <View
                  style={{
                    backgroundColor: palette.surfaceVariant,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 20,
                    borderBottomLeftRadius: 4,
                  }}
                >
                  <ActivityIndicator size="small" color={palette.text} />
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Input bar */}
        <View style={{ backgroundColor: palette.surface, borderTopWidth: 1, borderTopColor: palette.tabBarBorder }}>
          {/* Input row — padding is always fixed */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <TextInput
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: palette.tabBarBorder,
                borderRadius: 24,
                paddingHorizontal: 16,
                paddingVertical: 10,
                fontSize: 16,
                color: palette.text,
                backgroundColor: palette.background,
                marginRight: 10,
                maxHeight: 100,
              }}
              multiline
              placeholder="Type your message..."
              placeholderTextColor={palette.textMuted}
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity
              onPress={sendMessage}
              style={{
                backgroundColor: palette.primary,
                width: 44,
                height: 44,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 22,
                paddingLeft: 4, // slight offset to center paperplane visually
              }}
            >
              <IconSymbol name="paperplane.fill" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Spacer — visible only when keyboard is hidden, clears the tab bar */}
          {!isKeyboardVisible && (
            <View style={{ height: Platform.OS === 'ios' ? 83 : 0 }} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}