import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { Button, Chip, Divider, IconButton } from '@/components/ui';
import { useSearchStore } from '@/store';
import { formatDate, formatDateRange, nights } from '@/utils/format';
import { colors, radius, spacing, typography } from '@/theme';

export interface DateRangePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (checkIn: string, checkOut: string) => void;
}

const MONTH_NAMES = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'İyun',
  'İyul',
  'Avqust',
  'Sentyabr',
  'Oktyabr',
  'Noyabr',
  'Dekabr',
];

const WEEK_DAYS = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B'];

export const DateRangePickerSheet: React.FC<DateRangePickerSheetProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();
  const { checkInDate, checkOutDate, setDates } = useSearchStore();

  const [startDate, setStartDate] = useState<Date>(new Date(checkInDate));
  const [endDate, setEndDate] = useState<Date>(new Date(checkOutDate));

  // Current browsing month view
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date(checkInDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const totalNights = useMemo(() => {
    return nights(startDate, endDate);
  }, [startDate, endDate]);

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleSelectQuickTonight = () => {
    const todayDate = new Date(today);
    const tomorrowDate = new Date(today);
    tomorrowDate.setDate(todayDate.getDate() + 1);

    setStartDate(todayDate);
    setEndDate(tomorrowDate);
  };

  const handleSelectQuickWeekend = () => {
    const now = new Date(today);
    const day = now.getDay();
    // Friday
    const diffToFriday = (5 - day + 7) % 7;
    const friday = new Date(now);
    friday.setDate(now.getDate() + (diffToFriday === 0 ? 0 : diffToFriday));

    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);

    setStartDate(friday);
    setEndDate(sunday);
  };

  const handleDayPress = (dayDate: Date) => {
    if (dayDate < today) return;

    if (!startDate || (startDate && endDate)) {
      // First click: select start date, reset end date temporarily
      setStartDate(dayDate);
      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);
      setEndDate(nextDay);
    } else if (startDate && !endDate) {
      if (dayDate > startDate) {
        setEndDate(dayDate);
      } else {
        setStartDate(dayDate);
        const nextDay = new Date(dayDate);
        nextDay.setDate(dayDate.getDate() + 1);
        setEndDate(nextDay);
      }
    }
  };

  const handleConfirm = () => {
    const checkInStr = startDate.toISOString().split('T')[0];
    const checkOutStr = endDate.toISOString().split('T')[0];
    setDates(checkInStr, checkOutStr);
    onConfirm?.(checkInStr, checkOutStr);
    onClose();
  };

  // Generate calendar days for currentMonth
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    // Adjust so week starts on Monday (Monday = 0, Sunday = 6)
    const adjustedFirstDay = (firstDayIndex + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];
    // Padding before 1st of month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    // Month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tarixləri seçin</Text>
          <IconButton
            icon={<X size={22} color={colors.text} />}
            variant="ghost"
            size={40}
            onPress={onClose}
          />
        </View>

        {/* Selected date range indicator */}
        <View style={styles.rangeBanner}>
          <View>
            <Text style={styles.rangeLabel}>Seçilmiş aralıq</Text>
            <Text style={styles.rangeValue}>
              {formatDateRange(startDate, endDate)}
            </Text>
          </View>
          <View style={styles.nightsBadge}>
            <Text style={styles.nightsBadgeText}>{totalNights} gecə</Text>
          </View>
        </View>

        {/* Quick Shortcuts */}
        <View style={styles.shortcutRow}>
          <Chip
            label="Bu gün (1 gecə)"
            selected={isSameDay(startDate, today) && totalNights === 1}
            onPress={handleSelectQuickTonight}
          />
          <Chip
            label="Bu həftəsonu (2 gecə)"
            selected={totalNights === 2 && startDate.getDay() === 5}
            onPress={handleSelectQuickWeekend}
          />
        </View>

        <Divider marginVertical="sm" />

        <ScrollView
          contentContainerStyle={[
            styles.calendarScroll,
            { paddingBottom: insets.bottom + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Month Navigator */}
          <View style={styles.monthNav}>
            <IconButton
              icon={<ChevronLeft size={22} color={colors.text} />}
              variant="ghost"
              onPress={handlePrevMonth}
            />
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <IconButton
              icon={<ChevronRight size={22} color={colors.text} />}
              variant="ghost"
              onPress={handleNextMonth}
            />
          </View>

          {/* Weekday headers */}
          <View style={styles.weekHeader}>
            {WEEK_DAYS.map((wd, i) => (
              <Text key={i} style={styles.weekDayText}>
                {wd}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.grid}>
            {calendarDays.map((dayDate, index) => {
              if (!dayDate) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const isPast = dayDate < today;
              const isStart = isSameDay(dayDate, startDate);
              const isEnd = isSameDay(dayDate, endDate);
              const isInRange = dayDate > startDate && dayDate < endDate;

              return (
                <Pressable
                  key={dayDate.toISOString()}
                  disabled={isPast}
                  onPress={() => handleDayPress(dayDate)}
                  style={[
                    styles.dayCell,
                    isInRange && styles.dayInRange,
                    isStart && styles.dayStart,
                    isEnd && styles.dayEnd,
                  ]}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      (isStart || isEnd) && styles.dayCircleSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isPast && styles.dayTextPast,
                        (isStart || isEnd) && styles.dayTextSelected,
                        isInRange && styles.dayTextInRange,
                      ]}
                    >
                      {dayDate.getDate()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Confirm Button */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: insets.bottom + spacing.md },
          ]}
        >
          <Button
            title={`Tarixi Təsdiqlə (${totalNights} gecə)`}
            variant="primary"
            onPress={handleConfirm}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  rangeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    marginTop: spacing.xs,
  },
  rangeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  rangeValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: 2,
  },
  nightsBadge: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  nightsBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  calendarScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  monthTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: colors.brand,
  },
  dayStart: {
    backgroundColor: colors.primaryTint,
    borderTopLeftRadius: radius.pill,
    borderBottomLeftRadius: radius.pill,
  },
  dayEnd: {
    backgroundColor: colors.primaryTint,
    borderTopRightRadius: radius.pill,
    borderBottomRightRadius: radius.pill,
  },
  dayInRange: {
    backgroundColor: colors.primaryTint,
  },
  dayText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  dayTextPast: {
    color: colors.disabledText,
    opacity: 0.4,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  dayTextInRange: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

