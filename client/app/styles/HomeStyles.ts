import { StyleSheet } from 'react-native';
import type { AppPalette } from '@/constants/theme';

export function makeStyles(p: AppPalette) {
  return StyleSheet.create({
    // ─── Root Container ─────────────────────────────────────────────────────
    safeAreaView: {
      flex: 1,
      backgroundColor: p.background,
    },
    mainScrollContainer: {
      flexGrow: 1,
      padding: 12,
      justifyContent: 'space-evenly',
    },

    // ─── Typography ─────────────────────────────────────────────────────────
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
      color: p.text,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
      marginLeft: 4,
      opacity: 0.5,
      color: p.text,
    },
    textColor: {
      color: p.text,
    },
    textMuted: {
      color: p.textMuted,
    },
    iconColor: {
      color: p.icon,
    },

    // ─── Record Button ───────────────────────────────────────────────────────
    recordContainer: {
      alignItems: 'center',
      marginBottom: 0,
    },
    recordButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 50,
      backgroundColor: p.primary,
      padding: 60,
      borderRadius: 100,
      shadowColor: p.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
    },
    avButton: {
      backgroundColor: p.secondary,
    },
    recordButtonActive: {
      backgroundColor: p.danger,
    },
    recordText: {
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 12,
      color: '#fff',
    },

    // ─── Recording Animations ────────────────────────────────────────────────
    pulseRing: {
      position: 'absolute',
      width: 140,
      height: 140,
      marginBottom: 50,
      borderRadius: 100,
      backgroundColor: p.recordPulse,
      shadowColor: p.record,
      shadowOpacity: 0.5,
      shadowRadius: 1,
      zIndex: 0,
      elevation: 8,
    },
    pulseContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ─── Preview Controls ────────────────────────────────────────────────────
    previewContainer: {
      alignItems: 'center',
      width: '100%',
      gap: 12,
    },
    previewLabel: {
      fontSize: 13,
      opacity: 0.6,
      textAlign: 'center',
      color: p.text,
    },
    previewButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    previewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 24,
      gap: 6,
    },
    previewButtonText: {
      color: p.text,
      fontWeight: '600',
      fontSize: 15,
    },
    playButton: {
      backgroundColor: p.surface,
      borderWidth: 1,
      borderColor: p.surfaceVariant, 
    },
    sendButton: {
      backgroundColor: p.surface,
      borderWidth: 1,
      borderColor: p.surfaceVariant, 
    },
    discardButton: {
      backgroundColor: p.surface,
      borderWidth: 1,
      borderColor: p.surfaceVariant, 
    },

    // ─── Transcription Box ───────────────────────────────────────────────────
    transcriptionContainer: {
      backgroundColor: p.surfaceVariant,
      borderRadius: 20,
      padding: 18,
      marginHorizontal: 8,
      minHeight: 200,
      shadowColor: p.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    transcriptionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
      color: p.icon,
    },
    transcriptionText: {
      fontSize: 16,
      minHeight: 40,
      color: p.text,
    },

    // ─── Error ───────────────────────────────────────────────────────────────
    errorText: {
      color: p.danger,
      textAlign: 'center',
      marginBottom: 12,
      fontSize: 14,
    },

    // ─── Loading ─────────────────────────────────────────────────────────────
    loadingText: {
      color: p.text,
      marginBottom: 0,
    },
  });
}

// Dummy default export so Expo Router doesn't treat this file as a route
export default makeStyles;
