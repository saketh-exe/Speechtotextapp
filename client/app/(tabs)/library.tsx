import { View, Text, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeStyles } from '../styles/HomeStyles';
import { useNavBar } from '@/context/NavContext';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function LibraryScreen() {
  const { setIsScrolled } = useNavBar();
  const { palette } = useAppTheme();
  const S = makeStyles(palette);
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolled(e.nativeEvent.contentOffset.y > 60);
  };
  const scrollTest = Array.from({ length: 200 }, (_, i) => <Text key={i} style={S.textColor}>Saved Item {i + 1}</Text>);
  return (
    <SafeAreaView style={S.safeAreaView}>
      <ScrollView
        contentContainerStyle={S.mainScrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={[S.transcriptionTitle, S.iconColor]}>
            📚 Library
          </Text>
          <Text style={[S.transcriptionText, S.textColor, { marginTop: 16 }]}>
            Your saved transcriptions and audio files will appear here.
          </Text>
          {scrollTest}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
