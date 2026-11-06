import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { ChevronLeft, Heart, Images, Share2 } from 'lucide-react-native';
import { AUTO_ADVANCE_MS, RESUME_DELAY_MS } from '@/config/gallery';
import { useFavoritesStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';

interface HotelImageCarouselProps {
  hotelId: string;
  hotelName: string;
  hotelAddress: string;
  images: string[];
  onBack?: () => void;
  onPressImage?: (index: number) => void;
  topInset?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 310;
const THUMBNAIL_HEIGHT = 64;

export const HotelImageCarousel: React.FC<HotelImageCarouselProps> = ({
  hotelId,
  hotelName,
  hotelAddress,
  images,
  onBack,
  onPressImage,
  topInset = 0,
}) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isInteractingRef = useRef(false);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorited = isFavorite(hotelId);

  // Heart animation
  const heartScale = useSharedValue(1);
  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleFavoritePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    heartScale.value = withSequence(
      withSpring(1.35, { damping: 5, stiffness: 300 }),
      withSpring(1.0, { damping: 8, stiffness: 200 })
    );
    toggleFavorite(hotelId);
  }, [hotelId, toggleFavorite, heartScale]);

  const handleSharePress = useCallback(async () => {
    try {
      Haptics.selectionAsync();
      await Share.share({
        title: hotelName,
        message: `${hotelName} — ${hotelAddress}, Bakı | StayNow tətbiqində ən son qiymətlərlə bron edin:\nhttps://staynow.az/hotel/${hotelId}`,
        url: `https://staynow.az/hotel/${hotelId}`,
      });
    } catch {
      // ignore
    }
  }, [hotelId, hotelName, hotelAddress]);

  // Auto-advance logic
  const advanceToNext = useCallback(() => {
    if (images.length <= 1 || isInteractingRef.current) return;
    setActiveIndex((prev) => {
      const nextIndex = (prev + 1) % images.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      return nextIndex;
    });
  }, [images.length]);

  const startAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
    autoAdvanceTimerRef.current = setInterval(advanceToNext, AUTO_ADVANCE_MS);
  }, [advanceToNext]);

  const stopAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  // Initialize and clean up auto-advance
  useEffect(() => {
    startAutoAdvance();
    return () => {
      stopAutoAdvance();
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [startAutoAdvance, stopAutoAdvance]);

  // Handlers for user touch / drag
  const handleScrollBeginDrag = useCallback(() => {
    isInteractingRef.current = true;
    stopAutoAdvance();
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, [stopAutoAdvance]);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      if (index >= 0 && index < images.length) {
        setActiveIndex(index);
      }

      // Resume auto-advance after RESUME_DELAY_MS
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        isInteractingRef.current = false;
        startAutoAdvance();
      }, RESUME_DELAY_MS);
    },
    [images.length, startAutoAdvance]
  );

  const handleThumbnailPress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  }, []);

  const handleImagePress = useCallback(() => {
    Haptics.selectionAsync();
    if (onPressImage) {
      onPressImage(activeIndex);
    } else {
      router.push({
        pathname: '/hotel/[id]/gallery',
        params: { id: hotelId, initialIndex: activeIndex.toString() },
      });
    }
  }, [activeIndex, hotelId, onPressImage, router]);

  // Get 3 visible thumbnails (current and surrounding)
  const thumbnailIndices = React.useMemo(() => {
    if (images.length <= 3) return images.map((_, i) => i);
    if (activeIndex === 0) return [0, 1, 2];
    if (activeIndex >= images.length - 1) {
      return [images.length - 3, images.length - 2, images.length - 1];
    }
    return [activeIndex - 1, activeIndex, activeIndex + 1];
  }, [activeIndex, images]);

  return (
    <View style={styles.container}>
      {/* 1. Main Carousel */}
      <View style={styles.carouselWrapper}>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => `hotel-img-${index}`}
          onScrollBeginDrag={handleScrollBeginDrag}
          onMomentumScrollEnd={handleScrollEnd}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <Pressable
              style={styles.imageSlide}
              onPress={handleImagePress}
            >
              <Image
                source={{ uri: item }}
                style={styles.carouselImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
                placeholder={{ blurhash: 'L02?wf00~qj[00fQfQfQ00fQfQfQ' }}
              />
            </Pressable>
          )}
        />

        {/* Floating Top Controls */}
        <View
          style={[
            styles.floatingTopBar,
            { top: Math.max(topInset, 16) },
          ]}
        >
          <Pressable
            accessibilityLabel="Geri"
            accessibilityRole="button"
            hitSlop={6}
            style={styles.circleBtn}
            onPress={onBack ? onBack : () => router.back()}
          >
            <ChevronLeft size={22} color={colors.text} />
          </Pressable>

          <View style={styles.topRightBtns}>
            <Pressable
              accessibilityLabel="Paylaş"
              accessibilityRole="button"
              hitSlop={6}
              style={styles.circleBtn}
              onPress={handleSharePress}
            >
              <Share2 size={19} color={colors.text} />
            </Pressable>

            <Animated.View style={heartAnimStyle}>
              <Pressable
                accessibilityLabel="Favorit"
                accessibilityRole="button"
                hitSlop={6}
                style={styles.circleBtn}
                onPress={handleFavoritePress}
              >
                <Heart
                  size={20}
                  color={favorited ? colors.primary : colors.text}
                  fill={favorited ? colors.primary : 'transparent'}
                />
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {/* Floating Bottom Right Pagination Pill */}
        <View style={styles.paginationPill}>
          <Images size={13} color={colors.textSecondary} />
          <Text style={styles.paginationText}>
            {activeIndex + 1} / {images.length}
          </Text>
        </View>
      </View>

      {/* 2. 3 Thumbnail Previews beneath carousel */}
      {images.length > 1 && (
        <View style={styles.thumbnailsContainer}>
          {thumbnailIndices.map((thumbIdx) => {
            const isSelected = thumbIdx === activeIndex;
            return (
              <Pressable
                key={`thumb-${thumbIdx}`}
                style={[
                  styles.thumbnailWrapper,
                  isSelected && styles.thumbnailWrapperSelected,
                ]}
                onPress={() => handleThumbnailPress(thumbIdx)}
              >
                <Image
                  source={{ uri: images[thumbIdx] }}
                  style={styles.thumbnailImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={150}
                />
                {isSelected && <View style={styles.thumbnailHighlight} />}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.background,
  },
  carouselWrapper: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    position: 'relative',
    backgroundColor: colors.surfaceAlt,
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  floatingTopBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  topRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 14, 23, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  paginationPill: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15, 14, 23, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 10,
  },
  paginationText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  thumbnailWrapper: {
    flex: 1,
    height: THUMBNAIL_HEIGHT,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
  },
  thumbnailWrapperSelected: {
    borderColor: colors.brand,
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailHighlight: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(128, 106, 236, 0.18)',
  },
});
