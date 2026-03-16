import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface M3ProgressBarProps {
  progress: number;
  activeColor: string;
  trackColor: string;
  height?: number;
  gapSize?: number;
  strokeWidth?: number;
  isPlaying?: boolean;
}

const WAVE_LENGTH = 36;
const MathAmplitude = 5; 
const TOTAL_WIDTH = 1500; 

const WAVE_PATH = (() => {
  // Start slightly inward so the rounded cap is fully visible and not clipped
  let d = `M 3 12`; 
  for (let i = 3; i <= TOTAL_WIDTH; i += WAVE_LENGTH) {
    d += ` Q ${i + WAVE_LENGTH / 4} ${12 - MathAmplitude}, ${i + WAVE_LENGTH / 2} 12 T ${i + WAVE_LENGTH} 12`;
  }
  return d;
})();

export function M3ProgressBar({
  progress,
  activeColor,
  trackColor,
  height = 24, // Enough vertical space to accommodate wave amplitude
  gapSize = 4,
  strokeWidth = 4,
  isPlaying = false,
}: M3ProgressBarProps) {
  const anim = useRef(new Animated.Value(0)).current;
  const waveShiftAnim = useRef(new Animated.Value(0)).current;

  // Animate progress changes smoothly
  useEffect(() => {
    // Determine the duration dynamically based on the delta to make updates perfectly smooth.
    // If progress jumps back to 0 or very fast, make it instant.
    Animated.timing(anim, {
      toValue: Number.isNaN(progress) ? 0 : progress,
      duration: progress === 0 ? 0 : 150, // slightly longer than standard 100ms interval for natural bleed over
      easing: Easing.linear, 
      useNativeDriver: false, 
    }).start();
  }, [progress, anim]);

  // Animate the squiggly wave if audio is playing
  useEffect(() => {
    if (isPlaying) {
      waveShiftAnim.setValue(0);
      const loop = Animated.loop(
        Animated.timing(waveShiftAnim, {
          toValue: -WAVE_LENGTH,
          duration: 1000, 
          easing: Easing.linear, // Changed back to linear so the wave loop seamlessly meets its end
          useNativeDriver: Platform.OS !== 'web',
        })
      );
      loop.start();
      return () => loop.stop();
    } else {
      waveShiftAnim.stopAnimation();
    }
  }, [isPlaying, waveShiftAnim]);

  // Interpolations
  const activeWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const dynamicGap = anim.interpolate({
    inputRange: [0, 0.02, 0.98, 1],
    outputRange: [0, gapSize, gapSize, 0],
    extrapolate: 'clamp',
  });

  const trackOpacity = anim.interpolate({
    inputRange: [0.99, 1],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  return (
    <View
      style={{
        height,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12, // Keeps layout stable based on original static margin
      }}
    >
      {/* Active Squiggly Section Container */}
      <Animated.View
        style={{
          width: activeWidth,
          height: '100%',
          overflow: 'hidden',
          marginRight: dynamicGap,
        }}
      >
        <Animated.View 
           style={{ 
             flex: 1, 
             width: TOTAL_WIDTH, // Large enough to span width
             transform: [{ translateX: waveShiftAnim }] 
           }}
        >
          <Svg 
             height={height} 
             width={TOTAL_WIDTH} 
             viewBox={`0 0 ${TOTAL_WIDTH} ${height}`} 
             preserveAspectRatio="xMinYMid slice"
          >
            <Path 
               d={WAVE_PATH} 
               stroke={activeColor} 
               strokeWidth={strokeWidth} 
               fill="none" 
               strokeLinecap="round" 
               strokeLinejoin="round" 
             />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* Remaining Straight Track Section */}
      <Animated.View
        style={{
          flex: 1,
          height: strokeWidth,
          backgroundColor: trackColor,
          borderRadius: strokeWidth / 2,
          opacity: trackOpacity,
        }}
      />

      {/* Thumb / Pill shape at the head of the progress line */}
      <Animated.View
        style={{
          position: 'absolute',
          left: activeWidth,
          width: 8,
          height: 18,
          backgroundColor: activeColor,
          borderRadius: 4,
          transform: [{ translateX: -4 }],
          // Soft elevation for the expressive M3 feel
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 3,
        }}
      />
    </View>
  );
}
