import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import az from './az.json';
import en from './en.json';
import ru from './ru.json';

export const defaultNS = 'translation';
export const resources = {
  az: {
    translation: az,
  },
  en: {
    translation: en,
  },
  ru: {
    translation: ru,
  },
} as const;

const locales = Localization.getLocales();
const deviceLanguage = locales?.[0]?.languageCode ?? 'az';
const initialLang = ['az', 'en', 'ru'].includes(deviceLanguage) ? deviceLanguage : 'az';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,
    lng: initialLang,
    fallbackLng: 'az',
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
