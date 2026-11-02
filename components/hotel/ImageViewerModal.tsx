import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ImageViewerModalProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slide >= 0 && slide < images.length && slide !== activeIndex) {
      setActiveIndex(slide);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Top Header Bar */}
        <View style={[styles.header, { top: Math.max(insets.top, 20) }]}>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {activeIndex + 1} / {images.length}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Horizontal Fullscreen Swiper */}
        <FlatList
          data={images}
          keyExtractor={(_, index) => `modal-img-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={handleScroll}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image
                source={{ uri: item }}
                style={styles.image}
                contentFit="contain"
                transition={200}
                cachePolicy="memory-disk"
              />
            </View>
          )}
        />

        {/* Bottom indicator hint */}
        <View style={[styles.bottomHint, { bottom: Math.max(insets.bottom, 20) }]}>
          <Text style={styles.hintText}>Şəkilləri sola/sağa sürüşdürün</Text>
        </View>
      </View>
    </Modal>
  );
};

export default ImageViewerModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  bottomHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});
