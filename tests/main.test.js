import { describe, it, expect, beforeEach } from 'vitest';

describe('CMP integration', () => {
  beforeEach(() => {
    document.body.textContent = '';
    document.querySelectorAll('style[data-cmp]').forEach(el => el.remove());
    document.cookie = 'cmp_consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    window.dataLayer = [];
    delete window.cmpConfig;
    delete window.CMP;
  });

  it('exposes window.CMP with all API methods', async () => {
    const mod = await import('../src/main.js');
    expect(window.CMP).toBeDefined();
    expect(typeof window.CMP.open).toBe('function');
    expect(typeof window.CMP.close).toBe('function');
    expect(typeof window.CMP.acceptAll).toBe('function');
    expect(typeof window.CMP.rejectAll).toBe('function');
    expect(typeof window.CMP.getConsent).toBe('function');
    expect(typeof window.CMP.hasConsent).toBe('function');
    expect(typeof window.CMP.reset).toBe('function');
    expect(typeof window.CMP.on).toBe('function');
  });
});
