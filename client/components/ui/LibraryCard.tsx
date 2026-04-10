import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { M3ProgressBar } from '@/components/ui/M3ProgressBar';
import { makeStyles } from '../../app/styles/HomeStyles';
import { AppPalette } from '@/constants/theme';

type LibraryCardProps = {
  item: { uri: string; transcript: string; id?: string };
  index: number;
  palette: AppPalette;
  S: ReturnType<typeof makeStyles>;
  isItemPlaying: boolean;
  isItemActive: boolean;
  playbackProgress: number;
  handlePlayback: (uri: string) => void;
  handleDelete?: (index: number) => void;
  hideDelete?: boolean;
};

export function LibraryCard({
  item,
  index,
  palette,
  S,
  isItemPlaying,
  isItemActive,
  playbackProgress,
  handlePlayback,
  handleDelete,
  hideDelete
}: LibraryCardProps) {
  const displayTitle = item.id || item.uri.split('/').pop()?.split('.')[0] || `Recording ${index + 1}`;

  return (
    <View style={S.libraryCard}>
      {/* Left Content Area */}
      <View style={S.libraryCardContent}>
        
        <View style={S.libraryCardHeader}>
          <View style={S.libraryCardTitleContainer}>
            <IconSymbol name="mic.fill" size={18} color={palette.primary} style={{ marginRight: 8 }} />
            <Text style={S.libraryCardTitle} numberOfLines={1}>
              {displayTitle}
            </Text>
          </View>
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

      {/* Right Actions Area */}
      <View style={[S.libraryCardRight, { flexDirection: 'row', gap: 12 }]}>
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
        {!hideDelete && handleDelete && (
          <TouchableOpacity
            onPress={() => handleDelete(index)}
            activeOpacity={0.7}
            style={{ padding: 4 }}
          >
            <IconSymbol name="trash.fill" size={24} color={palette.danger} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
