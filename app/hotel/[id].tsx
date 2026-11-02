import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Share,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/constants/theme';
import { hotelService } from '@/services/hotelService';
import { Hotel } from '@/types/hotel';
import { getAmenity } from '@/constants/amenities';
import { ImageCarousel } from '@/components/hotel/ImageCarousel';
import { BookingBar } from '@/components/hotel/BookingBar';
import { HotelMiniMap } from '@/components/hotel/HotelMiniMap';

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, fonts, radius, spacing } = useTheme();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastOpacity = useSharedValue(0);

  const showToast = (message: string) => {
    setToastMessage(message);
    toastOpacity.value = withTiming(1, { duration: 250 });

    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 250 });
      setTimeout(() => setToastMessage(null), 300);
    }, 2200);
  };

  const toastAnimatedStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
    transform: [{ translateY: toastOpacity.value ? 0 : -10 }],
  }));

  useEffect(() => {
    let isMounted = true;
    if (id) {
      hotelService
        .getHotelById(id)
        .then((data) => {
          if (isMounted) {
            setHotel(data || null);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = async () => {
    if (!hotel) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `${hotel.name}\n${hotel.address}\nQiymət: ${hotel.discountedPrice} AZN / gecə\nStayNow ilə rezerv edin!`,
        title: hotel.name,
      });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  const openDirections = () => {
    if (!hotel) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hotel.latitude},${hotel.longitude}`;
    Linking.openURL(url);
  };

  const openMapTab = () => {
    if (!hotel) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/map',
      params: { hotelId: hotel.id },
    } as any);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: colors.textSecondary, fontFamily: fonts.medium },
          ]}>
          Otel məlumatları yüklənir...
        </Text>
      </View>
    );
  }

  if (!hotel) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.text, fontFamily: fonts.bold }]}>
          Otel tapılmadı
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.backHomeBtn,
            { backgroundColor: colors.primary, borderRadius: radius.button },
          ]}>
          <Text style={[styles.backHomeText, { fontFamily: fonts.semiBold }]}>
            Geri qayıt
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Toast Notification */}
      {toastMessage && (
        <AnimatedAnimatedToast
          style={[
            styles.toastContainer,
            {
              top: Math.max(insets.top + 60, 80),
              backgroundColor: 'rgba(18, 18, 43, 0.9)',
              borderRadius: radius.pill,
            },
            toastAnimatedStyle,
          ]}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={[styles.toastText, { fontFamily: fonts.medium }]}>
            {toastMessage}
          </Text>
        </AnimatedAnimatedToast>
      )}

      {/* Transparent Overlay Header */}
      <View
        style={[
          styles.headerOverlay,
          {
            top: insets.top + 8,
          },
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Geri qayıt"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={({ pressed }) => [
            styles.iconButton,
            { opacity: pressed ? 0.75 : 1 },
          ]}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Paylaş"
          onPress={handleShare}
          style={({ pressed }) => [
            styles.iconButton,
            { opacity: pressed ? 0.75 : 1 },
          ]}>
          <Ionicons name="share-outline" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 1) Image Carousel */}
        <ImageCarousel images={hotel.images} />

        <View style={[styles.bodyContent, { paddingHorizontal: spacing.lg }]}>
          {/* 2) Hotel Name & Rating */}
          <View style={[styles.titleSection, { marginTop: spacing.lg }]}>
            <Text
              style={[
                styles.hotelName,
                { color: colors.text, fontFamily: fonts.extraBold },
              ]}>
              {hotel.name}
            </Text>

            <View style={styles.ratingRow}>
              <View style={[styles.ratingPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="star" size={15} color="#FBBF24" />
                <Text style={[styles.ratingValue, { color: colors.text, fontFamily: fonts.bold }]}>
                  {hotel.rating.toFixed(1)}
                </Text>
              </View>
              <Text
                style={[
                  styles.reviewCount,
                  { color: colors.textSecondary, fontFamily: fonts.regular },
                ]}>
                ({hotel.reviewCount} rəy)
              </Text>
            </View>
          </View>

          {/* 3) Address Section & Mini Map Preview */}
          <View style={[styles.sectionContainer, { marginTop: spacing.lg }]}>
            <View style={styles.addressRow}>
              <Ionicons name="location-sharp" size={18} color={colors.primary} />
              <Text
                style={[
                  styles.addressText,
                  { color: colors.textSecondary, fontFamily: fonts.medium },
                ]}>
                {hotel.address}
              </Text>
            </View>

            {/* Mini Map Preview (160 height) */}
            <HotelMiniMap
              latitude={hotel.latitude}
              longitude={hotel.longitude}
              name={hotel.name}
              onOpenMap={openMapTab}
              onDirections={openDirections}
            />
          </View>

          {/* 4) About Section */}
          <View style={[styles.sectionContainer, { marginTop: spacing.xl }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, fontFamily: fonts.bold },
              ]}>
              Otel haqqında
            </Text>
            <Text
              numberOfLines={descriptionExpanded ? undefined : 3}
              style={[
                styles.descriptionText,
                { color: colors.textSecondary, fontFamily: fonts.regular, marginTop: spacing.sm },
              ]}>
              {hotel.description}
            </Text>
            {hotel.description.length > 100 && (
              <Pressable
                onPress={() => setDescriptionExpanded(!descriptionExpanded)}
                style={styles.moreButton}>
                <Text
                  style={[
                    styles.moreButtonText,
                    { color: colors.primary, fontFamily: fonts.semiBold },
                  ]}>
                  {descriptionExpanded ? 'Daha az göstər' : 'Daha çox oxu'}
                </Text>
                <Ionicons
                  name={descriptionExpanded ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={colors.primary}
                />
              </Pressable>
            )}
          </View>

          {/* 5) Amenities & Advantages */}
          <View style={[styles.sectionContainer, { marginTop: spacing.xl }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, fontFamily: fonts.bold },
              ]}>
              Üstünlüklər və xidmətlər
            </Text>

            {/* Amenities Grid (2 columns) */}
            <View style={[styles.amenitiesGrid, { marginTop: spacing.md }]}>
              {hotel.amenities.map((key) => {
                const amenity = getAmenity(key);
                return (
                  <View
                    key={key}
                    style={[
                      styles.amenityCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: radius.card,
                      },
                    ]}>
                    <View
                      style={[
                        styles.amenityIconCircle,
                        { backgroundColor: colors.background },
                      ]}>
                      <Ionicons
                        name={amenity.icon}
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.amenityCardText,
                        { color: colors.text, fontFamily: fonts.medium },
                      ]}>
                      {amenity.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Advantages with green checkmark */}
            <View style={[styles.advantagesContainer, { marginTop: spacing.md }]}>
              {hotel.advantages.map((adv, idx) => (
                <View key={`adv-${idx}`} style={styles.advantageRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.success}
                    style={styles.checkIcon}
                  />
                  <Text
                    style={[
                      styles.advantageText,
                      { color: colors.text, fontFamily: fonts.medium },
                    ]}>
                    {adv}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 6) Rules & Important Information */}
          <View style={[styles.sectionContainer, { marginTop: spacing.xl }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, fontFamily: fonts.bold },
              ]}>
              Bilməli olduğunuz qaydalar
            </Text>

            {/* Check-in / Check-out timing card */}
            <View
              style={[
                styles.timeInfoCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.card,
                  marginTop: spacing.md,
                },
              ]}>
              <View style={styles.timeBlock}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <View>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                    Giriş (Check-in)
                  </Text>
                  <Text style={[styles.timeValue, { color: colors.text, fontFamily: fonts.bold }]}>
                    {hotel.checkInTime}-dan etibarən
                  </Text>
                </View>
              </View>

              <View style={[styles.timeDivider, { backgroundColor: colors.border }]} />

              <View style={styles.timeBlock}>
                <Ionicons name="log-out-outline" size={20} color={colors.accent} />
                <View>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                    Çıxış (Check-out)
                  </Text>
                  <Text style={[styles.timeValue, { color: colors.text, fontFamily: fonts.bold }]}>
                    {hotel.checkOutTime}-dək
                  </Text>
                </View>
              </View>
            </View>

            {/* Rules list */}
            <View style={[styles.rulesList, { marginTop: spacing.md }]}>
              {hotel.rules.map((rule, idx) => (
                <View key={`rule-${idx}`} style={styles.ruleRow}>
                  <View style={[styles.ruleBullet, { backgroundColor: colors.textSecondary }]} />
                  <Text
                    style={[
                      styles.ruleText,
                      { color: colors.textSecondary, fontFamily: fonts.regular },
                    ]}>
                    {rule}
                  </Text>
                </View>
              ))}
            </View>

            {/* Important Info Card with Warning Left Border */}
            <View
              style={[
                styles.warningCard,
                {
                  backgroundColor: colors.surface,
                  borderLeftColor: colors.warning,
                  borderColor: colors.border,
                  borderRadius: radius.card,
                  marginTop: spacing.lg,
                },
              ]}>
              <View style={styles.warningHeader}>
                <Ionicons name="warning" size={20} color={colors.warning} />
                <Text
                  style={[
                    styles.warningTitle,
                    { color: colors.warning, fontFamily: fonts.bold },
                  ]}>
                  Vacib məlumatlar
                </Text>
              </View>
              {hotel.importantInfo.map((info, idx) => (
                <View key={`info-${idx}`} style={styles.warningInfoRow}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
                  <Text
                    style={[
                      styles.warningInfoText,
                      { color: colors.text, fontFamily: fonts.medium },
                    ]}>
                    {info}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 7 & Sticky Panel: BookingBar */}
      <BookingBar hotel={hotel} onToast={showToast} />
    </View>
  );
}

const AnimatedAnimatedToast = Animated.createAnimatedComponent(View);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
  },
  backHomeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 10,
  },
  backHomeText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 120, // 7) 120px bottom spacing
  },
  headerOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(18, 18, 43, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  bodyContent: {},
  titleSection: {},
  hotelName: {
    fontSize: 24,
    lineHeight: 30,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  ratingValue: {
    fontSize: 13,
  },
  reviewCount: {
    fontSize: 13,
  },
  sectionContainer: {},
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 14,
    flex: 1,
  },
  mapWrapper: {
    height: 160,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapFallbackText: {
    fontSize: 14,
  },
  mapActionsBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapHintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(18, 18, 43, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mapHintText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 2,
  },
  directionsText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  moreButtonText: {
    fontSize: 14,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  amenityCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    gap: 10,
  },
  amenityIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityCardText: {
    fontSize: 13,
    flex: 1,
  },
  advantagesContainer: {
    gap: 8,
  },
  advantageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkIcon: {
    marginTop: 1,
  },
  advantageText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  timeInfoCard: {
    borderWidth: 1,
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeLabel: {
    fontSize: 12,
  },
  timeValue: {
    fontSize: 14,
    marginTop: 2,
  },
  timeDivider: {
    width: 1,
    height: 36,
  },
  rulesList: {
    gap: 8,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  ruleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  ruleText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
  warningCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 14,
    gap: 10,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningTitle: {
    fontSize: 15,
  },
  warningInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warningInfoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
