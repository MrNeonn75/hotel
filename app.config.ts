import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'StayNow',
  slug: 'staynow',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'staynow',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.staynow.app',
    config: {
      googleMapsApiKey:
        process.env.GOOGLE_MAPS_IOS_API_KEY &&
        !process.env.GOOGLE_MAPS_IOS_API_KEY.includes('YourIosApiKey')
          ? process.env.GOOGLE_MAPS_IOS_API_KEY
          : undefined,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'StayNow tətbiqində yaxınlığınızdakı otelləri və xəritədə məsafəni göstərmək üçün məkana giriş icazəsi lazımdır.',
    },
  },
  android: {
    package: 'com.staynow.app',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    config: {
      googleMaps: {
        apiKey:
          process.env.GOOGLE_MAPS_ANDROID_API_KEY &&
          !process.env.GOOGLE_MAPS_ANDROID_API_KEY.includes('YourAndroidApiKey')
            ? process.env.GOOGLE_MAPS_ANDROID_API_KEY
            : undefined,
      },
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    'expo-image',
    'expo-font',
    'expo-localization',
    '@react-native-community/datetimepicker',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'StayNow tətbiqində yaxınlığınızdakı otelləri və xəritədə məsafəni göstərmək üçün məkana giriş icazəsi lazımdır.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    hasRealGoogleMapsKey: Boolean(
      process.env.GOOGLE_MAPS_ANDROID_API_KEY &&
        !process.env.GOOGLE_MAPS_ANDROID_API_KEY.includes('YourAndroidApiKey')
    ),
  },
});

