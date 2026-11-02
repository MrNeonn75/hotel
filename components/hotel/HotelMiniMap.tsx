import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';
import { darkMapStyle } from '@/constants/mapStyle';

interface HotelMiniMapProps {
  latitude: number;
  longitude: number;
  name: string;
  onOpenMap: () => void;
  onDirections: () => void;
}

export const HotelMiniMap: React.FC<HotelMiniMapProps> = ({
  latitude,
  longitude,
  name,
  onOpenMap,
  onDirections,
}) => {
  const { colors, radius, shadows, fonts, isDark } = useTheme();

  const hasRealGoogleMapsKey = Boolean(
    Constants.expoConfig?.extra?.hasRealGoogleMapsKey
  );
  const useUrlTiles = Platform.OS === 'android' && !hasRealGoogleMapsKey;

  const tileUrl = isDark
    ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
    : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

  return (
    <Pressable
      onPress={onOpenMap}
      accessibilityRole="button"
      accessibilityLabel="Xəritədə bax"
      style={[
        styles.mapWrapper,
        {
          borderRadius: radius.card,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
        shadows.soft,
      ]}>
      {/* Map container with pointerEvents="none" so clicks bubble to outer Pressable */}
      <View pointerEvents="none" style={styles.map}>
        <MapView
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={StyleSheet.absoluteFill}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          mapType={useUrlTiles ? 'none' : 'standard'}
          userInterfaceStyle={isDark ? 'dark' : 'light'}
          customMapStyle={
            !useUrlTiles && isDark && Platform.OS === 'android'
              ? darkMapStyle
              : undefined
          }
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.007,
            longitudeDelta: 0.007,
          }}>
          {useUrlTiles && (
            <UrlTile
              urlTemplate={tileUrl}
              maximumZ={19}
              flipY={false}
              zIndex={0}
            />
          )}
          <Marker
            coordinate={{
              latitude,
              longitude,
            }}
            title={name}
          />
        </MapView>
      </View>

      {/* Map Actions Bar */}
      <View style={styles.mapActionsBar}>
        <View style={styles.mapHintBadge}>
          <Ionicons name="expand-outline" size={13} color="#FFFFFF" />
          <Text style={styles.mapHintText}>Xəritədə aç</Text>
        </View>

        <Pressable
          onPress={onDirections}
          accessibilityRole="button"
          accessibilityLabel="Google Maps-də yol tarifi al"
          style={[
            styles.directionsBtn,
            { backgroundColor: colors.primary, borderRadius: radius.pill },
          ]}>
          <Ionicons name="navigate" size={13} color="#FFFFFF" />
          <Text style={[styles.directionsText, { fontFamily: fonts.bold }]}>
            Yol tarifi
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default HotelMiniMap;

const styles = StyleSheet.create({
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
  mapActionsBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  mapHintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(18, 18, 43, 0.72)',
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
});
