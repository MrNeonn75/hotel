import React, { useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  AlertTriangle,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Headset,
  MapPin,
  Moon,
  Navigation,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Star,
  User,
  X,
} from 'lucide-react-native';
import {
  Badge,
  Button,
  Card,
  Chip,
  Divider,
  EmptyState,
  IconButton,
  Input,
  ScreenHeader,
  Toast,
} from '@/components/ui';
import { useBookingsStore } from '@/store';
import { formatDate, formatNights, formatPrice } from '@/utils/format';
import { colors, radius, spacing, typography } from '@/theme';

const CANCELLATION_REASONS = [
  'Planlarım dəyişdi',
  'Təcili səbəb',
  'Başqa otel tapdım',
  'Tarixləri dəyişmək istəyirəm',
  'Digər',
];

export default function TripDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Array.isArray(id) ? id[0] : id ?? '';

  const { getBookingById, cancelBooking, addReview, reviews } = useBookingsStore();
  const booking = getBookingById(bookingId);

  // States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [isCancelling, setIsCancelling] = useState(false);

  // Review states
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const existingReview = reviews[bookingId];

  const handleCopyCode = async () => {
    if (!booking) return;
    await Clipboard.setStringAsync(booking.bookingCode);
    Haptics.selectionAsync();
    setToastMessage('Təsdiq kodu kopyalandı!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenNavigation = () => {
    if (!booking) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const query = encodeURIComponent(`${booking.hotelName}, ${booking.hotelAddress}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url!).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    });
  };

  const handleCallHotel = () => {
    Haptics.selectionAsync();
    Linking.openURL('tel:+994125990000');
  };

  const handleConfirmCancel = () => {
    if (!booking) return;
    setIsCancelling(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setTimeout(() => {
      cancelBooking(booking.id);
      setIsCancelling(false);
      setIsCancelModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setToastMessage('Rezervasiyanız uğurla ləğv edildi.');
      setTimeout(() => setToastMessage(null), 2500);
    }, 600);
  };

  const handleSubmitReview = () => {
    if (!booking) return;
    setIsSubmittingReview(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(() => {
      addReview(booking.id, reviewRating, reviewComment.trim());
      setIsSubmittingReview(false);
      setIsReviewModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setToastMessage('Rəyiniz üçün təşəkkür edirik!');
      setTimeout(() => setToastMessage(null), 2500);
    }, 500);
  };

  if (!booking) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Səfər Detalı" onBack={() => router.back()} />
        <EmptyState
          title="Rezervasiya tapılmadı"
          description="Axtardığınız səfər mövcud deyil və ya sistemdən silinib."
          actionTitle="Səfərlərə qayıt"
          onActionPress={() => router.back()}
        />
      </View>
    );
  }

  const isConfirmed = booking.status === 'confirmed';
  const isCancelled = booking.status === 'cancelled';
  const isCompleted = booking.status === 'completed';

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title="Səfər Detalı"
          subtitle={booking.bookingCode}
          onBack={() => router.back()}
          rightElement={
            <Badge
              label={isConfirmed ? 'Təsdiqləndi' : isCancelled ? 'Ləğv edilib' : 'Tamamlandı'}
              variant={isConfirmed ? 'savings' : isCancelled ? 'urgency' : 'primary'}
            />
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hotel Hero Card */}
        <Card style={styles.hotelCard}>
          <Image
            source={{ uri: booking.hotelImage }}
            style={styles.hotelImg}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
          />
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>{booking.hotelName}</Text>
            <Pressable
              style={styles.addressRow}
              onPress={() => router.push('/(tabs)/map')}
            >
              <MapPin size={14} color={colors.primary} />
              <Text style={styles.addressText} numberOfLines={1}>
                {booking.hotelAddress}
              </Text>
            </Pressable>
            <Text style={styles.roomTypeText}>{booking.roomType}</Text>
          </View>
        </Card>

        {/* 2. Dates & Hours Timeline */}
        <Card style={styles.timelineCard}>
          <View style={styles.timelineRow}>
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>GİRİŞ</Text>
              <Text style={styles.dateVal}>
                {formatDate(booking.checkInDate, 'short')}
              </Text>
              <Text style={styles.timeVal}>saat 14:00-dan</Text>
            </View>

            <View style={styles.moonBadge}>
              <Moon size={13} color={colors.primary} />
              <Text style={styles.moonText}>{formatNights(booking.nights)}</Text>
            </View>

            <View style={[styles.dateCol, { alignItems: 'flex-end' }]}>
              <Text style={styles.dateLabel}>ÇIXIŞ</Text>
              <Text style={styles.dateVal}>
                {formatDate(booking.checkOutDate, 'short')}
              </Text>
              <Text style={styles.timeVal}>saat 12:00-dək</Text>
            </View>
          </View>
        </Card>

        {/* 3. Booking Code & Copy Action */}
        <Card style={styles.codeCard}>
          <View>
            <Text style={styles.codeLabel}>REZERVASIYA KODU</Text>
            <Text style={styles.codeVal}>{booking.bookingCode}</Text>
          </View>

          <Pressable style={styles.copyBtn} onPress={handleCopyCode}>
            <Copy size={15} color={colors.primary} />
            <Text style={styles.copyBtnText}>Kopyala</Text>
          </Pressable>
        </Card>

        {/* 4. Guest Information */}
        <Card style={styles.sectionCard}>
          <Text style={styles.cardHeading}>Qonaq Məlumatları</Text>

          <View style={styles.infoLine}>
            <Text style={styles.infoLineLabel}>Əsas qonaq:</Text>
            <Text style={styles.infoLineVal}>
              {booking.guestInfo.firstName} {booking.guestInfo.lastName}
            </Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLineLabel}>E-poçt:</Text>
            <Text style={styles.infoLineVal}>{booking.guestInfo.email}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLineLabel}>Əlaqə nömrəsi:</Text>
            <Text style={styles.infoLineVal}>{booking.guestInfo.phone}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLineLabel}>Qonaq sayı:</Text>
            <Text style={styles.infoLineVal}>
              {booking.guests.adults} böyük{booking.guests.children > 0 ? `, ${booking.guests.children} uşaq` : ''} · {booking.guests.rooms} otaq
            </Text>
          </View>

          {booking.guestInfo.specialRequests ? (
            <View style={styles.infoLine}>
              <Text style={styles.infoLineLabel}>Xüsusi istək:</Text>
              <Text style={styles.infoLineVal}>{booking.guestInfo.specialRequests}</Text>
            </View>
          ) : null}
        </Card>

        {/* 5. Pricing Details */}
        <Card style={styles.sectionCard}>
          <Text style={styles.cardHeading}>Ödəniş Məlumatı</Text>

          <View style={styles.infoLine}>
            <Text style={styles.infoLineLabel}>Qalma haqqı:</Text>
            <Text style={styles.infoLineVal}>{formatPrice(booking.totalPrice)}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLineLabel}>Ödəniş statusu:</Text>
            <Badge label={isCancelled ? 'Geri qaytarılıb' : 'Ödənilib'} variant={isCancelled ? 'urgency' : 'savings'} />
          </View>

          <Divider marginVertical="sm" />

          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Cəmi məbləğ</Text>
            <Text style={styles.totalVal}>{formatPrice(booking.totalPrice)}</Text>
          </View>
        </Card>

        {/* 6. Quick Action Buttons */}
        <View style={styles.actionsGrid}>
          <Button
            title="İstiqamət al"
            variant="secondary"
            icon={<Navigation size={16} color={colors.text} />}
            onPress={handleOpenNavigation}
            style={styles.actionGridBtn}
          />

          <Button
            title="Otelə zəng et"
            variant="secondary"
            icon={<Phone size={16} color={colors.text} />}
            onPress={handleCallHotel}
            style={styles.actionGridBtn}
          />

          <Button
            title="Dəstək"
            variant="secondary"
            icon={<Headset size={16} color={colors.text} />}
            onPress={() => router.push('/account/support')}
            style={styles.actionGridBtn}
          />
        </View>

        {/* 7. Existing Review or Write Review for Completed Booking */}
        {isCompleted && (
          <Card style={styles.reviewSectionCard}>
            {existingReview ? (
              <View>
                <View style={styles.reviewHeaderRow}>
                  <Text style={styles.cardHeading}>Sizin Rəyiniz</Text>
                  <View style={styles.reviewStarsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={15}
                        color={s <= existingReview.rating ? colors.star : colors.textMuted}
                        fill={s <= existingReview.rating ? colors.star : 'transparent'}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.existingReviewDate}>{existingReview.date}</Text>
                {existingReview.comment ? (
                  <Text style={styles.existingReviewComment}>{existingReview.comment}</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.writeReviewPrompt}>
                <View style={styles.writeReviewIconCircle}>
                  <Star size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.writeReviewTitle}>Səfərinizi qiymətləndirin</Text>
                  <Text style={styles.writeReviewSub}>
                    Təcrübənizi digər səyahətçilərlə bölüşün
                  </Text>
                </View>
                <Button
                  title="Rəy yaz"
                  variant="primary"
                  fullWidth={false}
                  onPress={() => setIsReviewModalVisible(true)}
                  style={{ paddingHorizontal: spacing.md }}
                />
              </View>
            )}
          </Card>
        )}

        {/* 8. Cancel Booking Button (for confirmed bookings) */}
        {isConfirmed && (
          <Button
            title="Rezervasiyanı ləğv et"
            variant="danger"
            style={styles.cancelBookingBtn}
            onPress={() => setIsCancelModalVisible(true)}
          />
        )}
      </ScrollView>

      {/* CANCELLATION MODAL */}
      <Modal
        visible={isCancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsCancelModalVisible(false)}
          />
          <Card style={styles.cancelModalCard}>
            <View style={styles.cancelWarningCircle}>
              <AlertTriangle size={32} color={colors.urgency} />
            </View>

            <Text style={styles.cancelModalTitle}>
              Rezervasiyanı ləğv etmək istəyirsiniz?
            </Text>

            <Text style={styles.cancelModalDesc}>
              Pulsuz ləğvetmə şərtlərinə əsasən ödənilən{' '}
              <Text style={{ fontWeight: 'bold', color: colors.text }}>
                {formatPrice(booking.totalPrice)}
              </Text>{' '}
              məbləğ 100% bank kartınıza geri qaytarılacaq.
            </Text>

            <Text style={styles.cancelReasonLabel}>Ləğv səbəbi (ixtiyari):</Text>
            <View style={styles.cancelReasonsRow}>
              {CANCELLATION_REASONS.map((reason) => (
                <Chip
                  key={reason}
                  label={reason}
                  selected={selectedCancelReason === reason}
                  onPress={() => setSelectedCancelReason(reason)}
                />
              ))}
            </View>

            <View style={styles.cancelModalBtns}>
              <Button
                title="Bəli, ləğv et"
                variant="primary"
                loading={isCancelling}
                disabled={isCancelling}
                textStyle={{ color: colors.white }}
                style={{ backgroundColor: colors.urgency }}
                onPress={handleConfirmCancel}
              />
              <Button
                title="Geri qayıt"
                variant="secondary"
                disabled={isCancelling}
                onPress={() => setIsCancelModalVisible(false)}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* WRITE REVIEW MODAL */}
      <Modal
        visible={isReviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsReviewModalVisible(false)}
          />
          <Card style={styles.reviewModalCard}>
            <View style={styles.reviewModalHeader}>
              <Text style={styles.reviewModalTitle}>Rəy Yazın</Text>
              <IconButton
                icon={<X size={20} color={colors.text} />}
                variant="ghost"
                size={36}
                onPress={() => setIsReviewModalVisible(false)}
              />
            </View>

            <Text style={styles.reviewHotelName}>{booking.hotelName}</Text>
            <Text style={styles.reviewSubtitle}>
              Xidmət və qalma şəraitini necə qiymətləndirirsiniz?
            </Text>

            {/* Interactive Stars */}
            <View style={styles.interactiveStarsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setReviewRating(star);
                  }}
                  hitSlop={8}
                >
                  <Star
                    size={34}
                    color={star <= reviewRating ? colors.star : colors.border}
                    fill={star <= reviewRating ? colors.star : 'transparent'}
                  />
                </Pressable>
              ))}
            </View>

            {/* Review Comment Input */}
            <Input
              label="Fikirləriniz (ixtiyari)"
              placeholder="Otel haqqında təcrübənizi yazın..."
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={4}
              maxLength={300}
              inputStyle={styles.multilineInput}
            />

            <Button
              title="Rəyi göndər"
              variant="primary"
              loading={isSubmittingReview}
              disabled={isSubmittingReview}
              onPress={handleSubmitReview}
              style={{ marginTop: spacing.xs }}
            />
          </Card>
        </View>
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Toast message={toastMessage} type="success" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  hotelCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hotelImg: {
    width: '100%',
    height: 140,
    backgroundColor: colors.surfaceHighlight,
  },
  hotelInfo: {
    padding: spacing.md,
  },
  hotelName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  addressText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  roomTypeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
  },
  timelineCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateCol: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  dateVal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: 2,
  },
  timeVal: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  moonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moonText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  codeVal: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.brand,
    letterSpacing: 1,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  copyBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  sectionCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  cardHeading: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  infoLineLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  infoLineVal: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  totalVal: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.brand,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionGridBtn: {
    flex: 1,
    height: 48,
  },
  reviewSectionCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewStarsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  existingReviewDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  existingReviewComment: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  writeReviewPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  writeReviewIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  writeReviewTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  writeReviewSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cancelBookingBtn: {
    borderColor: colors.urgency,
    height: 52,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  cancelModalCard: {
    padding: spacing.xl,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.sm,
  },
  cancelWarningCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.urgencyTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  cancelModalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  cancelModalDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  cancelReasonLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  cancelReasonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cancelModalBtns: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  reviewModalCard: {
    padding: spacing.xl,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewModalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  reviewHotelName: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
  },
  reviewSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  interactiveStarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  multilineInput: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 999,
  },
});