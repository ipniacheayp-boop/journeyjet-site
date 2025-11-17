import { useState, useEffect, useCallback } from 'react';
import enTranslations from '@/i18n/en.json';
import esTranslations from '@/i18n/es.json';

type Language = 'en' | 'es';
type TranslationKey = string;

const translations = {
  en: enTranslations,
  es: esTranslations,
};

const STORAGE_KEY = 'language';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved === 'es' ? 'es' : 'en') as Language;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const t = useCallback((key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key itself if not found
          }
        }
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [language]);

  const toggleLanguage = useCallback((lang?: Language) => {
    if (lang) {
      setLanguage(lang);
    } else {
      setLanguage(prev => prev === 'en' ? 'es' : 'en');
    }
  }, []);

  return {
    language,
    t,
    toggleLanguage,
  };
};
