import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ImageViewerModal } from './ImageViewerModal';

export interface ImageCarouselProps {
  images: string[];
  hotelName: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 340;

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  hotelName,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const isInteractingRef = useRef<boolean>(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-advance loop: 1 second interval, pauses if interacting
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isInteractingRef.current && images.length > 1) {
        setActiveIndex((prev) => {
          const nextIndex = (prev + 1) % images.length;
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Pause on user touch, resume after 4s
  const handleUserTouchStart = () => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
  };

  const handleUserTouchEnd = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 4000);
  };

  const handleScroll = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index >= 0 && index < images.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        title: hotelName,
        message: `${hotelName} otelindЙ™ bu gecЙ™ ГјГ§Гјn xГјsusi tЙ™klif! StayNow tЙ™tbiqindЙ™ baxД±n.`,
      });
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* ЕћЙ™killЙ™r Karuseli */}
      <FlatList
        ref={flatListRef}
        data={images}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchStart={handleUserTouchStart}
        onTouchEnd={handleUserTouchEnd}
        onScrollBeginDrag={handleUserTouchStart}
        onScrollEndDrag={handleUserTouchEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsModalOpen(true);
            }}
            style={styles.imageSlide}
          >
            <Image
              source={{ uri: item }}
              style={styles.image}
              contentFit="cover"
              priority={index === 0 ? 'high' : 'normal'}
              transition={200}
              cachePolicy="memory-disk"
            />
          </Pressable>
        )}
      />

      {/* ГњstdЙ™: Geri vЙ™ PaylaЕџ DГјymЙ™lЙ™ri (Safe Area nЙ™zЙ™rЙ™ alД±nmaqla) */}
      <View style={[styles.topActions, { top: insets.top + 10 }]}>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          hitSlop={12}
          style={styles.circleBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>

        <Pressable
          onPress={handleShare}
          hitSlop={12}
          style={styles.circleBtn}
        >
          <Ionicons name="share-outline" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* SaДџ Altda: "3/6" SayДџac Pilli */}
      <View style={styles.counterPill}>
        <Ionicons name="images-outline" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
        <Text style={styles.counterText}>
          {activeIndex + 1} / {images.length}
        </Text>
      </View>

      {/* Tam Ekran ЕћЙ™kil ModalД± */}
      <ImageViewerModal
        visible={isModalOpen}
        images={images}
        initialIndex={activeIndex}
        onClose={() => setIsModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    position: 'relative',
    backgroundColor: '#000000',
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topActions: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterPill: {
    position: 'absolute',
    bottom: 34,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  counterText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default ImageCarousel;