import { View, Text, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeStyles } from '../styles/HomeStyles';
import { useNavBar } from '@/context/NavContext';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function ChatScreen() {
  const { setIsScrolled } = useNavBar();
  const { palette } = useAppTheme();
  const S = makeStyles(palette);
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolled(e.nativeEvent.contentOffset.y > 60);
  };
  return (
    <SafeAreaView style={S.safeAreaView}>
      <ScrollView
        contentContainerStyle={S.mainScrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={[S.transcriptionTitle, S.iconColor]}>
            Chat
          </Text>
          <Text style={[S.transcriptionText, S.textColor, { marginTop: 16 }]}>
            Start a conversation about your transcriptions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
