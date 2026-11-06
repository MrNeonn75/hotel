import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const googleMapsAndroidKey =
    process.env.GOOGLE_MAPS_ANDROID_API_KEY?.replace(/^"|"$/g, '') || undefined;
  const googleMapsIosKey =
    process.env.GOOGLE_MAPS_IOS_API_KEY?.replace(/^"|"$/g, '') || undefined;

  return {
    ...config,
    name: 'HotelTonight',
    slug: 'hoteltonight',
    version: '2.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'hoteltonight',
    userInterfaceStyle: 'automatic',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.hoteltonight.app',
      config: {
        googleMapsApiKey: googleMapsIosKey,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'HotelTonight tətbiqində yaxınlığınızdakı otelləri və xəritədə məsafəni göstərmək üçün məkan icazəsi lazımdır.',
      },
    },
    android: {
      package: 'com.staynow.app',
      versionCode: 2,
      adaptiveIcon: {
        backgroundColor: '#592391',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: googleMapsAndroidKey,
        },
      },
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#592391',
          image: './assets/images/splash-icon.png',
          imageWidth: 90,
        },
      ],
      'expo-localization',
      '@react-native-community/datetimepicker',
      'expo-secure-store',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'StayNow tətbiqində yaxınlığınızdakı otelləri və xəritədə məsafəni göstərmək üçün məkan icazəsi lazımdır.',
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
      hasGoogleMapsKey: Boolean(googleMapsAndroidKey || googleMapsIosKey),
    },
  };
};