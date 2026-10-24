import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';
import jaJP from './locales/ja-JP';

const LOCALES = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
};

export const SUPPORTED_LANGUAGES = [
  { value: 'zh-CN', label: '简体中文', nativeName: '简体中文' },
  { value: 'en-US', label: 'English (US)', nativeName: 'English' },
  { value: 'ja-JP', label: '日本語', nativeName: '日本語' },
];

const LanguageContext = createContext({
  language: 'zh-CN',
  setLanguage: () => {},
  t: (key) => key,
  languages: SUPPORTED_LANGUAGES,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('sparklink_hub_language');
      if (saved && LOCALES[saved]) return saved;
    } catch {}
    return 'zh-CN';
  });

  const setLanguage = useCallback((lang) => {
    if (LOCALES[lang]) {
      setLanguageState(lang);
      try {
        localStorage.setItem('sparklink_hub_language', lang);
      } catch {}
    }
  }, []);

  const t = useCallback((path, paramsOrFallback = {}) => {
    if (!path) return '';
    const keys = path.split('.');
    let curr = LOCALES[language];
    for (const k of keys) {
      if (curr && typeof curr === 'object' && k in curr) {
        curr = curr[k];
      } else {
        curr = null;
        break;
      }
    }
    let res = (typeof curr === 'string') ? curr : null;

    if (!res) {
      // Fallback to zh-CN
      let fallbackCurr = LOCALES['zh-CN'];
      for (const k of keys) {
        if (fallbackCurr && typeof fallbackCurr === 'object' && k in fallbackCurr) {
          fallbackCurr = fallbackCurr[k];
        } else {
          fallbackCurr = null;
          break;
        }
      }
      if (typeof fallbackCurr === 'string') {
        res = fallbackCurr;
      }
    }

    if (!res) {
      return typeof paramsOrFallback === 'string' ? paramsOrFallback : path;
    }

    if (typeof paramsOrFallback === 'object' && paramsOrFallback !== null) {
      return res.replace(/\{(\w+)\}/g, (_, key) => {
        return paramsOrFallback[key] !== undefined ? paramsOrFallback[key] : `{${key}}`;
      });
    }

    return res;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    languages: SUPPORTED_LANGUAGES,
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  return useContext(LanguageContext);
}
export default LanguageContext;
