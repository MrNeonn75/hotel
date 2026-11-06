import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import az from './az.json';
import en from './en.json';
import ru from './ru.json';

export const defaultNS = 'translation';
export const resources = {
  az: { translation: az },
  en: { translation: en },
  ru: { translation: ru },
} as const;

let initialLang = 'az';
try {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0 && locales[0]?.languageCode) {
    const code = locales[0].languageCode.toLowerCase();
    if (['az', 'en', 'ru'].includes(code)) {
      initialLang = code;
    }
  }
} catch {
  initialLang = 'az';
}

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

