import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Share2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useHotelQuery } from '@/services/queries';
import { colors, radius, spacing, typography } from '@/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ZoomableImageProps {
  uri: string;
  onDismiss: () => void;
}

const ZoomableImageItem: React.FC<ZoomableImageProps> = ({ uri, onDismiss }) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Double tap to zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
      } else {
        scale.value = withSpring(2.4);
        savedScale.value = 2.4;
      }
    });

  // Pinch to zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 4));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1.05) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      }
    });

  // Pan downwards to dismiss when not zoomed
  const panGesture = Gesture.Pan()
    .activeOffsetY([10, 1000])
    .onUpdate((e) => {
      if (scale.value <= 1.1 && e.translationY > 0) {
        translateY.value = e.translationY;
        opacity.value = Math.max(0.3, 1 - e.translationY / 350);
      }
    })
    .onEnd((e) => {
      if (scale.value <= 1.1 && (e.translationY > 120 || e.velocityY > 700)) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 }, () => {
          runOnJS(onDismiss)();
        });
      } else {
        translateY.value = withSpring(0);
        opacity.value = withTiming(1);
      }
    });

  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  const imageAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.slideContainer}>
        <Animated.View style={[styles.imageWrapper, imageAnimStyle]}>
          <Image
            source={{ uri }}
            style={styles.fullImage}
            contentFit="contain"
            transition={150}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

export default function HotelGalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, initialIndex } = useLocalSearchParams<{
    id: string;
    initialIndex?: string;
  }>();
  const hotelId = Array.isArray(id) ? id[0] : id ?? 'bulevard-house';
  const startIndex = initialIndex ? parseInt(initialIndex, 10) : 0;

  const { data: hotel } = useHotelQuery(hotelId);
  const images = hotel?.images ?? [];

  const [currentIndex, setCurrentIndex] = useState(
    isNaN(startIndex) ? 0 : startIndex
  );

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      if (index >= 0 && index < images.length) {
        setCurrentIndex(index);
      }
    },
    [images.length]
  );

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        {/* Top Controls Bar */}
        <View
          style={[
            styles.topBar,
            { top: Math.max(insets.top, 16) },
          ]}
        >
          <Pressable
            accessibilityLabel="Bağla"
            style={styles.circleBtn}
            onPress={handleClose}
          >
            <X size={22} color={colors.white} />
          </Pressable>

          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {images.length > 0 ? `${currentIndex + 1} / ${images.length}` : '0 / 0'}
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Swipeable Fullscreen Images */}
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={startIndex >= 0 && startIndex < images.length ? startIndex : 0}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={handleScrollEnd}
          keyExtractor={(_, index) => `fullscreen-img-${index}`}
          renderItem={({ item }) => (
            <ZoomableImageItem uri={item} onDismiss={handleClose} />
          )}
        />

        {/* Bottom hint */}
        <View
          style={[
            styles.bottomHintContainer,
            { bottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <Text style={styles.bottomHintText}>
            Böyütmək üçün iki dəfə toxunun · Bağlamaq üçün aşağı sürüşdürün
          </Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  topBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  counterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  bottomHintContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  bottomHintText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
