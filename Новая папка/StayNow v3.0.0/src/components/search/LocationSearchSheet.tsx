import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import {
  Clock,
  LocateFixed,
  MapPin,
  Search,
  X,
} from 'lucide-react-native';
import { Divider, IconButton, Input, ListRow } from '@/components/ui';
import { useSearchStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';

export interface LocationSearchSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation?: (location: string) => void;
}

const POPULAR_LOCATIONS = [
  'Bakı mərkəzi',
  'Dənizkənarı bulvar',
  'İçərişəhər',
  'Nizami küçəsi (Tarqovı)',
  'Nərimanov rayonu',
  'Xətai rayonu',
  'Heydər Əliyev Beynəlxalq Hava Limanı',
];

const RECENT_SEARCHES = ['Bakı, Azərbaycan', 'İçərişəhər, Səbail'];

export const LocationSearchSheet: React.FC<LocationSearchSheetProps> = ({
  visible,
  onClose,
  onSelectLocation,
}) => {
  const insets = useSafeAreaInsets();
  const { setLocation } = useSearchStore();

  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleSelect = (loc: string) => {
    setLocation(loc);
    onSelectLocation?.(loc);
    onClose();
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLocating(true);
      setLocationError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(
          'Məkan icazəsi verilmədi. Tənzimləmələrdən icazə verərək yaxınlığınızdakı otelləri tapa bilərsiniz.'
        );
        setLocating(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (currentLocation) {
        handleSelect('Cari məkanım (Bakı mərkəzi)');
      }
    } catch {
      setLocationError('Məkan müəyyənləşdirilərkən xəta baş verdi. Zəhmət olmasa siyahıdan seçin.');
    } finally {
      setLocating(false);
    }
  };

  const filteredPopular = POPULAR_LOCATIONS.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase().trim())
  );

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
          <Text style={styles.headerTitle}>Məkan seçimi</Text>
          <IconButton
            icon={<X size={22} color={colors.text} />}
            variant="ghost"
            size={40}
            onPress={onClose}
          />
        </View>

        {/* Search input with autofocus */}
        <View style={styles.inputWrapper}>
          <Input
            placeholder="Otel, rayon və ya məkan axtarın..."
            value={query}
            onChangeText={setQuery}
            autoFocus
            leftIcon={<Search size={20} color={colors.primary} />}
            containerStyle={styles.searchField}
          />
        </View>

        <FlatList
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              {/* Nearby Locate Option */}
              <Pressable
                onPress={handleUseCurrentLocation}
                disabled={locating}
                style={({ pressed }) => [
                  styles.nearbyRow,
                  pressed && styles.nearbyRowPressed,
                ]}
              >
                <View style={styles.locateIconCircle}>
                  {locating ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <LocateFixed size={20} color={colors.primary} />
                  )}
                </View>
                <View style={styles.nearbyTextContainer}>
                  <Text style={styles.nearbyTitle}>Yaxınlığımda axtar</Text>
                  <Text style={styles.nearbySubtitle}>
                    Cari GPS məkanınız əsasında ən yaxın otellər
                  </Text>
                </View>
              </Pressable>

              {locationError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{locationError}</Text>
                </View>
              )}

              <Divider marginVertical="md" />

              {/* Recent Searches */}
              {!query && (
                <>
                  <Text style={styles.sectionTitle}>Son axtarışlar</Text>
                  {RECENT_SEARCHES.map((item, idx) => (
                    <ListRow
                      key={`recent-${idx}`}
                      title={item}
                      icon={<Clock size={18} color={colors.textSecondary} />}
                      onPress={() => handleSelect(item)}
                      style={styles.listItem}
                    />
                  ))}
                  <Divider marginVertical="md" />
                </>
              )}

              <Text style={styles.sectionTitle}>
                {query ? 'Axtarış nəticələri' : 'Populyar yerlər'}
              </Text>
            </>
          }
          data={filteredPopular}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <ListRow
              title={item}
              icon={<MapPin size={18} color={colors.primary} />}
              onPress={() => handleSelect(item)}
              style={styles.listItem}
            />
          )}
        />
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
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  inputWrapper: {
    paddingHorizontal: spacing.lg,
  },
  searchField: {
    marginBottom: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  nearbyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    marginTop: spacing.xs,
  },
  nearbyRowPressed: {
    backgroundColor: colors.surfaceHighlight,
  },
  locateIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  nearbyTextContainer: {
    flex: 1,
  },
  nearbyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  nearbySubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: colors.urgencyTint,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.urgency,
    lineHeight: typography.lineHeight.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listItem: {
    marginBottom: spacing.xs,
  },
});

