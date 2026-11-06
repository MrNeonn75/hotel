import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  LayoutChangeEvent,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/useTheme';

export interface SlideToBookProps {
  onComplete: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  title?: string;
}

const THUMB_SIZE = 50;

export const SlideToBook: React.FC<SlideToBookProps> = ({
  onComplete,
  isLoading = false,
  disabled = false,
  title = 'Sürüşdürərək rezerv et',
}) => {
  const { colors, typography, radius } = useTheme();

  const [trackWidth, setTrackWidth] = useState(0);
  const [completed, setCompleted] = useState(false);

  const dragX = useRef(new Animated.Value(0)).current;
  const lastHapticProgress = useRef(0);

  const maxDrag = Math.max(0, trackWidth - THUMB_SIZE - 8);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isLoading && !disabled && !completed,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        !isLoading && !disabled && !completed && Math.abs(gestureState.dx) > 5,

      onPanResponderMove: (_, gestureState) => {
        if (maxDrag <= 0) return;
        const bounded = Math.max(0, Math.min(gestureState.dx, maxDrag));
        dragX.setValue(bounded);

        // Haptic feedback tick along the way
        const progress = bounded / maxDrag;
        if (Math.abs(progress - lastHapticProgress.current) > 0.25) {
          lastHapticProgress.current = progress;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (maxDrag <= 0) return;
        if (gestureState.dx >= maxDrag * 0.85) {
          // Snap to end
          Animated.timing(dragX, {
            toValue: maxDrag,
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            setCompleted(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onComplete();
          });
        } else {
          // Snap back to start
          Animated.spring(dragX, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const onLayoutTrack = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const handleTapComplete = () => {
    if (isLoading || disabled || completed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCompleted(true);
    onComplete();
  };

  // Text opacity fades out as thumb moves
  const textOpacity = maxDrag > 0
    ? dragX.interpolate({
        inputRange: [0, maxDrag * 0.6],
        outputRange: [1, 0.1],
        extrapolate: 'clamp',
      })
    : 1;

  return (
    <View style={styles.outerContainer}>
      <View
        onLayout={onLayoutTrack}
        style={[
          styles.track,
          {
            backgroundColor: disabled ? colors.border : '#592391',
            borderRadius: radius.pill,
          },
        ]}
      >
        {/* Track Label */}
        <Animated.View style={[styles.labelContainer, { opacity: textOpacity }]}>
          <Text style={[typography.heading, styles.trackText]}>
            {isLoading ? 'Rezervasiya edilir...' : title}
          </Text>
          <Ionicons
            name="chevron-forward-outline"
            size={16}
            color="rgba(255, 255, 255, 0.7)"
            style={{ marginLeft: 4 }}
          />
        </Animated.View>

        {/* Sliding Thumb */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.thumb,
            {
              borderRadius: THUMB_SIZE / 2,
              transform: [{ translateX: dragX }],
            },
          ]}
        >
          <View style={styles.thumbInner}>
            <Ionicons
              name={isLoading ? 'sync' : 'arrow-forward'}
              size={22}
              color="#592391"
            />
          </View>
        </Animated.View>
      </View>

      {/* Fallback fast-tap label for accessibility */}
      <Pressable onPress={handleTapComplete} hitSlop={8} style={styles.fallbackTap}>
        <Text style={[typography.micro, { color: colors.textSecondary }]}>
          və ya təsdiqləmək üçün toxunun
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  track: {
    width: '100%',
    height: 58,
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 4,
    shadowColor: '#592391',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  labelContainer: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 30,
  },
  trackText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackTap: {
    marginTop: 6,
  },
});
