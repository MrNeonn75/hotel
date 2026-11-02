import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';

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

  const primaryColor = isDark ? '#818CF8' : '#4F46E5';
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: ${isDark ? '#0E0F1F' : '#F7F7FB'};
      overflow: hidden;
    }
    .hotel-mini-pin {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: ${primaryColor};
      border: 3px solid #FFFFFF;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hotel-mini-pin-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #FFFFFF;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false
    }).setView([${latitude}, ${longitude}], 15);

    L.tileLayer('${tileUrl}', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-pin',
      html: '<div class="hotel-mini-pin"><div class="hotel-mini-pin-dot"></div></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker([${latitude}, ${longitude}], { icon: pinIcon }).addTo(map);
  </script>
</body>
</html>
`;

  return (
    <Pressable
      onPress={onOpenMap}
      accessibilityRole="button"
      accessibilityLabel={`Xəritədə ${name} otelinə bax`}
      style={[
        styles.mapWrapper,
        {
          borderRadius: radius.card,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
        shadows.soft,
      ]}>
      {/* Mini Leaflet map iframe with pointer-events disabled so clicks trigger onOpenMap */}
      <View style={styles.iframeContainer} pointerEvents="none">
        <iframe
          title={`${name} Map Preview`}
          srcDoc={htmlContent}
          style={styles.iframe as any}
        />
      </View>

      {/* Map Actions Bar */}
      <View style={styles.mapActionsBar}>
        <View style={styles.mapHintBadge}>
          <Ionicons name="expand-outline" size={13} color="#FFFFFF" />
          <Text style={styles.mapHintText}>Xəritədə aç</Text>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onDirections();
          }}
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
    cursor: 'pointer',
  } as any,
  iframeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  } as any,
  iframe: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    pointerEvents: 'none',
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
    cursor: 'pointer',
  } as any,
  directionsText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});
