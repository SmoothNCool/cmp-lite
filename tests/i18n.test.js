import { describe, it, expect } from 'vitest';
import { getTranslations, detectLanguage } from '../src/i18n.js';

describe('detectLanguage', () => {
  it('returns cs when html lang is cs', () => {
    document.documentElement.lang = 'cs';
    expect(detectLanguage('auto')).toBe('cs');
  });

  it('returns en when html lang is en', () => {
    document.documentElement.lang = 'en';
    expect(detectLanguage('auto')).toBe('en');
  });

  it('falls back to cs for unknown language', () => {
    document.documentElement.lang = 'de';
    const origLang = navigator.language;
    Object.defineProperty(navigator, 'language', { value: 'de', configurable: true });
    expect(detectLanguage('auto')).toBe('cs');
    Object.defineProperty(navigator, 'language', { value: origLang, configurable: true });
  });

  it('respects explicit lang config', () => {
    document.documentElement.lang = 'en';
    expect(detectLanguage('cs')).toBe('cs');
  });
});

describe('getTranslations', () => {
  it('returns Czech translations', () => {
    const t = getTranslations('cs');
    expect(t.banner.title).toBeTruthy();
    expect(t.buttons.acceptAll).toBeTruthy();
  });

  it('returns English translations', () => {
    const t = getTranslations('en');
    expect(t.banner.title).toBeTruthy();
    expect(t.buttons.acceptAll).toBeTruthy();
  });
});
