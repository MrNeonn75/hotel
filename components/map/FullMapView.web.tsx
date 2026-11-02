import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Hotel } from '@/types/hotel';
import { formatPrice } from '@/utils/format';

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
  isDark,
  initialFocusHotelId,
  mapRef,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Implement animateToRegion and fitToCoordinates on mapRef for web compatibility
  useEffect(() => {
    if (mapRef) {
      (mapRef as any).current = {
        animateToRegion: (
          region: { latitude: number; longitude: number },
          _duration?: number
        ) => {
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              {
                type: 'PAN_TO',
                lat: region.latitude,
                lng: region.longitude,
              },
              '*'
            );
          }
        },
        fitToCoordinates: (
          coordinates: { latitude: number; longitude: number }[],
          _options?: any
        ) => {
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              {
                type: 'FIT_BOUNDS',
                coordinates,
              },
              '*'
            );
          }
        },
      };
    }
  }, [mapRef]);

  // Listen for postMessage from the Leaflet map iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type === 'SELECT_HOTEL') {
          const found = hotels.find((h) => h.id === data.hotelId);
          if (found) {
            onSelectHotel(found);
          }
        } else if (data?.type === 'DESELECT_HOTEL') {
          onSelectHotel(null);
        }
      } catch {
        // ignore parsing errors
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [hotels, onSelectHotel]);

  // Center on selected hotel when it changes
  useEffect(() => {
    if (selectedHotel && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'FLY_TO',
          lat: selectedHotel.latitude,
          lng: selectedHotel.longitude,
          hotelId: selectedHotel.id,
        },
        '*'
      );
    }
  }, [selectedHotel]);

  // Generate Leaflet HTML
  const primaryColor = isDark ? '#818CF8' : '#4F46E5';
  const accentColor = isDark ? '#FF7F6E' : '#FF6B57';
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const initialHotel = initialFocusHotelId
    ? hotels.find((h) => h.id === initialFocusHotelId)
    : hotels[0];
  const centerLat = initialHotel?.latitude || 40.3725;
  const centerLng = initialHotel?.longitude || 49.845;

  const markersJson = JSON.stringify(
    hotels.map((h) => ({
      id: h.id,
      name: h.name,
      lat: h.latitude,
      lng: h.longitude,
      price: formatPrice(h.discountedPrice),
      rating: h.rating,
      image: h.images[0],
    }))
  );

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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .price-pill-marker {
      background: ${primaryColor};
      color: #FFFFFF;
      font-weight: 700;
      font-size: 13px;
      padding: 5px 10px;
      border-radius: 999px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 2px solid #FFFFFF;
      white-space: nowrap;
      cursor: pointer;
      transition: transform 0.15s ease, background-color 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .price-pill-marker:hover {
      transform: scale(1.1);
    }
    .price-pill-marker.selected {
      background: ${accentColor} !important;
      transform: scale(1.15);
      border-color: #FFFFFF;
      z-index: 1000 !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([${centerLat}, ${centerLng}], 13);

    L.tileLayer('${tileUrl}', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    const hotels = ${markersJson};
    const markers = {};
    let activeId = "${selectedHotel?.id || ''}";

    hotels.forEach(hotel => {
      const isSel = hotel.id === activeId;
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: '<div id="pill-' + hotel.id + '" class="price-pill-marker ' + (isSel ? 'selected' : '') + '">' + hotel.price + '</div>',
        iconSize: [60, 30],
        iconAnchor: [30, 15]
      });

      const m = L.marker([hotel.lat, hotel.lng], { icon: customIcon }).addTo(map);
      markers[hotel.id] = m;

      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        selectHotel(hotel.id);
        window.parent.postMessage({ type: 'SELECT_HOTEL', hotelId: hotel.id }, '*');
      });
    });

    map.on('click', () => {
      deselectAll();
      window.parent.postMessage({ type: 'DESELECT_HOTEL' }, '*');
    });

    function selectHotel(id) {
      deselectAll();
      activeId = id;
      const el = document.getElementById('pill-' + id);
      if (el) el.classList.add('selected');
      const h = hotels.find(x => x.id === id);
      if (h) {
        map.panTo([h.lat, h.lng], { animate: true });
      }
    }

    function deselectAll() {
      activeId = '';
      document.querySelectorAll('.price-pill-marker').forEach(el => {
        el.classList.remove('selected');
      });
    }

    window.addEventListener('message', (event) => {
      const data = event.data;
      if (data && data.type === 'FLY_TO') {
        selectHotel(data.hotelId);
      } else if (data && data.type === 'PAN_TO') {
        map.panTo([data.lat, data.lng], { animate: true });
      } else if (data && data.type === 'FIT_BOUNDS' && Array.isArray(data.coordinates) && data.coordinates.length > 0) {
        const bounds = data.coordinates.map(c => [c.latitude, c.longitude]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });
  </script>
</body>
</html>
`;

  return (
    <View style={styles.container}>
      <iframe
        ref={iframeRef as any}
        title="StayNow Map"
        srcDoc={htmlContent}
        style={styles.iframe as any}
      />
    </View>
  );
};

export default FullMapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  iframe: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
  },
});
