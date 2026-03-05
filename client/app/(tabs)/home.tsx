import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Animated, Easing, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { useAudioRecorder, useAudioPlayer, AudioModule, RecordingPresets } from 'expo-audio';
import { makeStyles } from '../styles/HomeStyles';
import { useNavBar } from '@/context/NavContext';
import { useAppTheme } from '@/hooks/useAppTheme';

const BACKEND_URL = 'http://10.195.103.1:3000/api/speech-to-text/';

export default function HomeScreen() {
  const { setIsScrolled } = useNavBar();
  const { palette } = useAppTheme();
  const S = makeStyles(palette);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isAvRecording, setIsAvRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolled(e.nativeEvent.contentOffset.y > 60);
  };

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const audioPlayer = useAudioPlayer();

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
      .then((text) => console.log('Backend says:', text))
      .catch((err) => console.error('Backend ping failed:', err));
  }, []);

  useEffect(() => {
    const sub = audioPlayer.addListener('playbackStatusUpdate', (status: any) => {
      if (status.didJustFinish) {
        setIsPlaying(false);
        audioPlayer.seekTo(0);
        audioPlayer.pause();
      }
    });
    return () => sub.remove();
  }, [audioPlayer]);

  const handleAvStart = async () => {
    try {
      setError('');
      setTranscript('');
      setRecordedUri(null);
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
      setRecordedUri(uri);
    } catch {
      setError('Could not stop recording.');
    }
  };

  const handlePlayback = () => {
    try {
      if (isPlaying) {
        audioPlayer.pause();
        setIsPlaying(false);
      } else {
        audioPlayer.play();
        setIsPlaying(true);
      }
    } catch {
      setError('Could not play recording.');
    }
  };

  const handleSendToBackend = async () => {
    if (!recordedUri) return;
    try {
      setIsLoading(true);
      audioPlayer.pause();
      setIsPlaying(false);

      const formData = new FormData();
      formData.append('audio', {
        uri: recordedUri,
        name: 'recording.m4a',
        type: 'audio/m4a',
      } as any);

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setTranscript(data.transcript ?? 'No transcription returned.');
      setRecordedUri(null);
    } catch {
      setError('Failed to transcribe audio.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    audioPlayer.pause();
    setIsPlaying(false);
    setRecordedUri(null);
    setTranscript('');
    setError('');
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

          {recordedUri && !isAvRecording && (
            <View style={S.previewContainer}>
              <Text style={[S.previewLabel, S.textColor]}>
                Listen before sending
              </Text>
              <View style={S.previewButtons}>
                <TouchableOpacity
                  style={[S.previewButton, S.playButton]}
                  onPress={handlePlayback}
                  activeOpacity={0.8}
                >
                  <IconSymbol
                    name={isPlaying ? 'pause.fill' : 'play.fill'}
                    size={20}
                    color= {palette.icon}
                  />
                  <Text style={S.previewButtonText}>
                    {isPlaying ? 'Pause' : 'Play'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[S.previewButton, S.sendButton]}
                  onPress={handleSendToBackend}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color={palette.icon} />
                  ) : (
                    <IconSymbol name="paperplane.fill" size={20} color={palette.icon} />
                  )}
                  <Text style={S.previewButtonText}>
                    {isLoading ? 'Sending...' : 'Send'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[S.previewButton, S.discardButton]}
                  onPress={handleDiscard}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="trash.fill" size={20} color={palette.danger} />
                  <Text style={S.previewButtonText}>Discard</Text>
                </TouchableOpacity>
              </View>
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
