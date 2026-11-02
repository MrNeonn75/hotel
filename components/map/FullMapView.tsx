import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import { Hotel } from '@/types/hotel';
import { darkMapStyle } from '@/constants/mapStyle';
import { HotelMarker } from './HotelMarker';

interface FullMapViewProps {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  onSelectHotel: (hotel: Hotel | null) => void;
  showsUserLocation: boolean;
  isDark: boolean;
  initialFocusHotelId?: string;
  mapRef: React.RefObject<any>;
}

export const FullMapView: React.FC<FullMapViewProps> = ({
  hotels,
  selectedHotel,
  onSelectHotel,
  showsUserLocation,
  isDark,
  initialFocusHotelId,
  mapRef,
}) => {
  const isMapReadyRef = useRef(false);

  // If a real Google Maps API key is not configured in .env on Android,
  // Google Maps base tiles fail authorization (displaying an empty beige grid).
  // In that case, we automatically render high-performance CartoDB tiles via UrlTile.
  const hasRealGoogleMapsKey = Boolean(
    Constants.expoConfig?.extra?.hasRealGoogleMapsKey
  );
  const useUrlTiles = Platform.OS === 'android' && !hasRealGoogleMapsKey;

  const tileUrl = isDark
    ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
    : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

  const fitAllHotels = useCallback(() => {
    if (!mapRef.current || hotels.length === 0) return;

    const coordinates = hotels.map((h) => ({
      latitude: h.latitude,
      longitude: h.longitude,
    }));

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: { top: 90, right: 50, bottom: 180, left: 50 },
      animated: true,
    });
  }, [hotels, mapRef]);

  const handleMapReady = () => {
    isMapReadyRef.current = true;

    if (initialFocusHotelId) {
      const targetHotel = hotels.find((h) => h.id === initialFocusHotelId);
      if (targetHotel && mapRef.current) {
        onSelectHotel(targetHotel);
        mapRef.current.animateToRegion(
          {
            latitude: targetHotel.latitude,
            longitude: targetHotel.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          600
        );
        return;
      }
    }

    fitAllHotels();
  };

  useEffect(() => {
    if (initialFocusHotelId && isMapReadyRef.current && mapRef.current) {
      const targetHotel = hotels.find((h) => h.id === initialFocusHotelId);
      if (targetHotel) {
        onSelectHotel(targetHotel);
        mapRef.current.animateToRegion(
          {
            latitude: targetHotel.latitude,
            longitude: targetHotel.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          600
        );
      }
    }
  }, [initialFocusHotelId, hotels, onSelectHotel, mapRef]);

  // Default Baku center
  const initialRegion = {
    latitude: 40.3725,
    longitude: 49.845,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <MapView
      ref={mapRef}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      style={styles.map}
      initialRegion={initialRegion}
      onMapReady={handleMapReady}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      showsCompass={false}
      mapType={useUrlTiles ? 'none' : 'standard'}
      userInterfaceStyle={isDark ? 'dark' : 'light'}
      customMapStyle={
        !useUrlTiles && isDark && Platform.OS === 'android'
          ? darkMapStyle
          : undefined
      }
      onPress={() => onSelectHotel(null)}>
      {useUrlTiles && (
        <UrlTile
          urlTemplate={tileUrl}
          maximumZ={19}
          flipY={false}
          zIndex={0}
        />
      )}

      {hotels.map((hotel) => {
        const isSelected = selectedHotel?.id === hotel.id;

        return (
          <Marker
            key={hotel.id}
            coordinate={{
              latitude: hotel.latitude,
              longitude: hotel.longitude,
            }}
            zIndex={isSelected ? 100 : 1}
            onPress={(e) => {
              e.stopPropagation();
              onSelectHotel(hotel);
            }}>
            <HotelMarker hotel={hotel} isSelected={isSelected} />
          </Marker>
        );
      })}
    </MapView>
  );
};

export default FullMapView;

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFill,
  },
});
