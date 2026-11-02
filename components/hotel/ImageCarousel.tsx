import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { ImageViewerModal } from './ImageViewerModal';
import { useTheme } from '@/constants/theme';

interface ImageCarouselProps {
  images: string[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 300;

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const { radius } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const flatListRef = useRef<FlatList<string>>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInteractingRef = useRef<boolean>(false);

  const startAutoPlay = useCallback(() => {
    if (images.length <= 1) return;
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);

    autoPlayTimerRef.current = setInterval(() => {
      if (isInteractingRef.current) return;
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 1000);
  }, [images.length]);

  const pauseAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const handleUserInteraction = useCallback(() => {
    isInteractingRef.current = true;
    pauseAutoPlay();

    // 4 saniyə sonra avto-keçidi bərpa et
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      startAutoPlay();
    }, 4000);
  }, [pauseAutoPlay, startAutoPlay]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [startAutoPlay]);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
    handleUserInteraction();
  };

  const onScrollBeginDrag = () => {
    handleUserInteraction();
  };

  const handleImagePress = () => {
    handleUserInteraction();
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        keyExtractor={(_, index) => `carousel-img-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <Pressable onPress={handleImagePress} style={styles.imageSlide}>
            <Image
              source={{ uri: item }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          </Pressable>
        )}
      />

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {images.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <View
              key={`dot-${index}`}
              style={[
                styles.dot,
                isActive ? styles.activeDot : styles.inactiveDot,
                { borderRadius: radius.pill },
              ]}
            />
          );
        })}
      </View>

      {/* Right Bottom Counter Pill (3/5) */}
      <View style={[styles.counterBadge, { borderRadius: radius.pill }]}>
        <Text style={styles.counterText}>
          {currentIndex + 1}/{images.length}
        </Text>
      </View>

      {/* Fullscreen Photo Viewer Modal */}
      <ImageViewerModal
        visible={modalVisible}
        images={images}
        initialIndex={currentIndex}
        onClose={() => {
          setModalVisible(false);
          handleUserInteraction();
        }}
      />
    </View>
  );
};

export default ImageCarousel;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    position: 'relative',
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
  },
  image: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 14,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 5,
  },
  dot: {
    height: 6,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#FFFFFF',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  counterBadge: {
    position: 'absolute',
    bottom: 14,
    right: 20,
    backgroundColor: 'rgba(18, 18, 43, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 5,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
