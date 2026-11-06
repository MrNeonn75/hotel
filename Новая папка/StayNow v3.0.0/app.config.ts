import { ExpoConfig, ConfigContext } from 'expo/config';
import fs from 'fs';
import path from 'path';

// API açarlarını src/config/maps.ts və ya mühit dəyişənlərindən oxuyuruq
function readGoogleMapsApiKeys(): { android?: string; ios?: string; hasKey: boolean } {
  let androidKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  let iosKey = process.env.GOOGLE_MAPS_IOS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';

  try {
    const mapsConfigPath = path.resolve(__dirname, 'src/config/maps.ts');
    if (fs.existsSync(mapsConfigPath)) {
      const content = fs.readFileSync(mapsConfigPath, 'utf8');
      const generalMatch = content.match(/GOOGLE_MAPS_API_KEY\s*=\s*['"`](.*?)['"`]/);
      const androidMatch = content.match(/GOOGLE_MAPS_ANDROID_API_KEY\s*=\s*['"`](.*?)['"`]/);
      const iosMatch = content.match(/GOOGLE_MAPS_IOS_API_KEY\s*=\s*['"`](.*?)['"`]/);

      if (!androidKey) {
        androidKey = (androidMatch && androidMatch[1]) || (generalMatch && generalMatch[1]) || '';
      }
      if (!iosKey) {
        iosKey = (iosMatch && iosMatch[1]) || (generalMatch && generalMatch[1]) || '';
      }
    }
  } catch {
    // fallback
  }

  const clean = (k: string) => {
    const trimmed = k.trim();
    return trimmed && trimmed !== 'BURAYA_API_ACARINI_YAZ' ? trimmed : undefined;
  };

  const finalAndroid = clean(androidKey);
  const finalIos = clean(iosKey);

  return {
    android: finalAndroid,
    ios: finalIos,
    hasKey: Boolean(finalAndroid || finalIos),
  };
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const mapKeys = readGoogleMapsApiKeys();

  return {
    ...config,
    name: 'StayNow',
    slug: 'staynow',
    version: '3.0.2',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'staynow',
    userInterfaceStyle: 'dark',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.staynow.app',
      config: {
        googleMapsApiKey: mapKeys.ios,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'StayNow tətbiqində yaxınlığınızdakı otelləri və xəritədə məsafəni göstərmək üçün məkan icazəsi lazımdır.',
      },
    },
    android: {
      package: 'com.staynow.app',
      versionCode: 5,
      adaptiveIcon: {
        backgroundColor: '#806AEC',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
      },
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: mapKeys.android,
        },
      },
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#0F0E17',
          image: './assets/images/splash-icon.png',
          imageWidth: 90,
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      hasGoogleMapsKey: mapKeys.hasKey,
    },
  };
};
