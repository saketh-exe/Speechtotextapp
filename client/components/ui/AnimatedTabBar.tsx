import { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavBar } from '@/context/NavContext';
import { useAppTheme } from '@/hooks/useAppTheme';

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isScrolled, setIsScrolled } = useNavBar();
  const { palette } = useAppTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: isScrolled ? 1 : 0,
      useNativeDriver: false,
      tension: 60,
      friction: 12,
    }).start();
  }, [anim, isScrolled]);

  const marginHorizontal = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 48] });
  const borderRadius = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 44] });
  const bottom = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 20] });
  const paddingVertical = anim.interpolate({ inputRange: [0, 1], outputRange: [20, 20] });
  const elevation = anim.interpolate({ inputRange: [0, 1], outputRange: [20, 30] });
  const shadowOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.8] });
  const shadowRadius = anim.interpolate({ inputRange: [0, 1], outputRange: [12, 20] });
  const borderTopWidth = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        flexDirection: 'row',
        left: marginHorizontal,
        right: marginHorizontal,
        bottom,
        borderRadius,
        borderTopWidth,
        borderTopColor: palette.tabBarBorder,
        backgroundColor: palette.tabBar,
        paddingTop: paddingVertical,
        paddingBottom: paddingVertical,
        shadowColor: palette.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity,
        shadowRadius,
        elevation,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            setIsScrolled(false);
            navigation.navigate(route.name, route.params as object);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            activeOpacity={0.7}
          >
            {options.tabBarIcon?.({
              color: isFocused ? palette.icon : palette.tabBarInactive,
              size: 24,
              focused: isFocused,
            })}
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}
