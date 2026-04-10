import cs from './translations/cs.json';
import en from './translations/en.json';

const TRANSLATIONS = { cs, en };
const SUPPORTED = Object.keys(TRANSLATIONS);
const FALLBACK = 'cs';

export function detectLanguage(configLang) {
  if (configLang !== 'auto' && SUPPORTED.includes(configLang)) {
    return configLang;
  }
  const htmlLang = document.documentElement.lang?.toLowerCase().split('-')[0];
  if (SUPPORTED.includes(htmlLang)) return htmlLang;
  const navLang = navigator.language?.toLowerCase().split('-')[0];
  if (SUPPORTED.includes(navLang)) return navLang;
  return FALLBACK;
}

export function getTranslations(lang) {
  return TRANSLATIONS[lang] || TRANSLATIONS[FALLBACK];
}
