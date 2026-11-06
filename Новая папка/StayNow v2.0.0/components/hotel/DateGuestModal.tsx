import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { ModalSheet } from '@/components/common/ModalSheet';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useSearchStore } from '@/store/searchStore';
import {
  toISODateString,
  formatDateRange,
  nightsBetween,
  formatGuests,
  parseLocalDate,
} from '@/utils/format';

export interface DateGuestModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DateGuestModal: React.FC<DateGuestModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors, typography, radius, isDark } = useTheme();
  const { checkIn, checkOut, guests, setDates, setGuests } = useSearchStore();

  const [selectedStart, setSelectedStart] = useState<string>(checkIn);
  const [selectedEnd, setSelectedEnd] = useState<string>(checkOut);
  const [adults, setAdults] = useState<number>(guests.adults);
  const [children, setChildren] = useState<number>(guests.children);

  // Sync state when modal opens
  React.useEffect(() => {
    if (visible) {
      setSelectedStart(checkIn);
      setSelectedEnd(checkOut);
      setAdults(guests.adults);
      setChildren(guests.children);
    }
  }, [visible, checkIn, checkOut, guests]);

  const today = toISODateString(new Date());

  const handleDayPress = (day: { dateString: string }) => {
    const clickedDate = day.dateString;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // First click: select start date
      setSelectedStart(clickedDate);
      setSelectedEnd('');
    } else if (selectedStart && !selectedEnd) {
      // Second click: select end date or reset if clicked earlier
      if (clickedDate <= selectedStart) {
        setSelectedStart(clickedDate);
        setSelectedEnd('');
      } else {
        setSelectedEnd(clickedDate);
      }
    }
  };

  // Build markedDates object for react-native-calendars
  const buildMarkedDates = () => {
    const marks: Record<string, any> = {};

    if (selectedStart && !selectedEnd) {
      marks[selectedStart] = {
        startingDay: true,
        endingDay: true,
        color: colors.primary,
        textColor: '#FFFFFF',
      };
    } else if (selectedStart && selectedEnd) {
      marks[selectedStart] = {
        startingDay: true,
        color: colors.primary,
        textColor: '#FFFFFF',
      };

      // Fill dates in between
      let curr = new Date(parseLocalDate(selectedStart).getTime() + 86400000);
      const endD = parseLocalDate(selectedEnd);

      while (curr < endD) {
        const iso = toISODateString(curr);
        marks[iso] = {
          color: colors.primaryTint,
          textColor: colors.primary,
        };
        curr = new Date(curr.getTime() + 86400000);
      }

      marks[selectedEnd] = {
        endingDay: true,
        color: colors.primary,
        textColor: '#FFFFFF',
      };
    }

    return marks;
  };

  const handleApply = () => {
    const finalStart = selectedStart || today;
    const finalEnd =
      selectedEnd && selectedEnd > finalStart
        ? selectedEnd
        : toISODateString(new Date(parseLocalDate(finalStart).getTime() + 86400000));

    setDates(finalStart, finalEnd);
    setGuests({ adults, children });
    onClose();
  };

  const totalNights =
    selectedStart && selectedEnd ? nightsBetween(selectedStart, selectedEnd) : 1;

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title="Tarix və Qonaqlar"
      subtitle={`${formatDateRange(
        selectedStart || today,
        selectedEnd || selectedStart || today
      )} · ${totalNights} gecə`}
      footer={
        <Button
          title={`Tətbiq et (${totalNights} gecə)`}
          onPress={handleApply}
          style={{ width: '100%' }}
        />
      }
    >
      {/* Təqvim */}
      <View
        style={[
          styles.calendarContainer,
          {
            backgroundColor: isDark ? colors.surfaceAlt : colors.background,
            borderRadius: radius.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Calendar
          minDate={today}
          markingType="period"
          markedDates={buildMarkedDates()}
          onDayPress={handleDayPress}
          theme={{
            calendarBackground: 'transparent',
            textSectionTitleColor: colors.textSecondary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            textDisabledColor: isDark ? '#4B4B5A' : '#D1D1DB',
            arrowColor: colors.primary,
            monthTextColor: colors.text,
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 15,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
          }}
        />
      </View>

      {/* Qonaq Sayı Bölməsi */}
      <View
        style={[
          styles.guestsContainer,
          {
            borderColor: colors.border,
            borderRadius: radius.card,
            backgroundColor: colors.surfaceAlt,
          },
        ]}
      >
        <Text style={[typography.heading, { color: colors.text, marginBottom: 16 }]}>
          Qonaq sayı
        </Text>

        {/* Böyüklər */}
        <View style={styles.counterRow}>
          <View>
            <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>
              Böyüklər
            </Text>
            <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 2 }]}>
              18 yaş və yuxarı
            </Text>
          </View>

          <View style={styles.stepperContainer}>
            <Pressable
              onPress={() => setAdults(Math.max(1, adults - 1))}
              disabled={adults <= 1}
              style={[
                styles.stepperBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  opacity: adults <= 1 ? 0.4 : 1,
                },
              ]}
            >
              <Ionicons name="remove" size={18} color={colors.text} />
            </Pressable>

            <Text style={[typography.heading, { color: colors.text, minWidth: 28, textAlign: 'center' }]}>
              {adults}
            </Text>

            <Pressable
              onPress={() => setAdults(Math.min(10, adults + 1))}
              disabled={adults >= 10}
              style={[
                styles.stepperBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  opacity: adults >= 10 ? 0.4 : 1,
                },
              ]}
            >
              <Ionicons name="add" size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Uşaqlar */}
        <View style={[styles.counterRow, { marginTop: 14 }]}>
          <View>
            <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>
              Uşaqlar
            </Text>
            <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 2 }]}>
              0 - 17 yaş
            </Text>
          </View>

          <View style={styles.stepperContainer}>
            <Pressable
              onPress={() => setChildren(Math.max(0, children - 1))}
              disabled={children <= 0}
              style={[
                styles.stepperBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  opacity: children <= 0 ? 0.4 : 1,
                },
              ]}
            >
              <Ionicons name="remove" size={18} color={colors.text} />
            </Pressable>

            <Text style={[typography.heading, { color: colors.text, minWidth: 28, textAlign: 'center' }]}>
              {children}
            </Text>

            <Pressable
              onPress={() => setChildren(Math.min(8, children + 1))}
              disabled={children >= 8}
              style={[
                styles.stepperBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  opacity: children >= 8 ? 0.4 : 1,
                },
              ]}
            >
              <Ionicons name="add" size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 6,
  },
  guestsContainer: {
    borderWidth: 1,
    padding: 16,
    marginTop: 18,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export default DateGuestModal;