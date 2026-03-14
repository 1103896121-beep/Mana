import { useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

export type Language = 'en' | 'zh';

// 简单的全局状态管理，确保所有使用 hook 的组件能同步语言切换
let sharedLanguage: Language = (localStorage.getItem('mana_language') as Language) || 'zh';
const listeners: Set<(l: Language) => void> = new Set();

export const useTranslation = () => {
  const [language, setInternalLanguage] = useState<Language>(sharedLanguage);

  useEffect(() => {
    const listener = (l: Language) => setInternalLanguage(l);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setLanguage = (l: Language) => {
    sharedLanguage = l;
    localStorage.setItem('mana_language', l);
    listeners.forEach(listener => listener(l));
  };

  const t = (path: string) => {
    const keys = path.split('.');
    let current: any = translations[language];
    
    for (const key of keys) {
      if (!current || current[key] === undefined) {
        console.warn(`Translation path not found: ${path}`);
        return path;
      }
      current = current[key];
    }
    
    return current;
  };

  return { t, language, setLanguage };
};
