"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import en from '../i18n/en.json';
import am from '../i18n/am.json';
import om from '../i18n/om.json';

const translations = { en, am, om };
const defaultLang = 'en';

const LanguageContext = createContext({
  lang: defaultLang,
  setLang: (l) => {},
  t: (k) => k,
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(defaultLang);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lang');
      if (stored && translations[stored]) setLang(stored);
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lang', lang);
    } catch (e) {}
  }, [lang]);

  const t = (key) => {
    const parts = key.split('.');
    let cur = translations[lang] || {};
    for (const p of parts) {
      cur = cur?.[p];
      if (cur === undefined) return key;
    }
    return typeof cur === 'string' ? cur : key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

export default LanguageProvider;
