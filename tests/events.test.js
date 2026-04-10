import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bindDataAttributes } from '../src/events.js';

describe('bindDataAttributes', () => {
  beforeEach(() => {
    document.body.textContent = '';
  });

  it('binds data-cmp-open to open callback', () => {
    const open = vi.fn();
    const el = document.createElement('a');
    el.setAttribute('data-cmp-open', '');
    el.textContent = 'Cookie settings';
    document.body.appendChild(el);
    bindDataAttributes({ open, acceptAll: vi.fn(), rejectAll: vi.fn() });
    el.click();
    expect(open).toHaveBeenCalled();
  });

  it('binds data-cmp-accept-all', () => {
    const acceptAll = vi.fn();
    const el = document.createElement('button');
    el.setAttribute('data-cmp-accept-all', '');
    el.textContent = 'OK';
    document.body.appendChild(el);
    bindDataAttributes({ open: vi.fn(), acceptAll, rejectAll: vi.fn() });
    el.click();
    expect(acceptAll).toHaveBeenCalled();
  });

  it('binds data-cmp-reject-all', () => {
    const rejectAll = vi.fn();
    const el = document.createElement('button');
    el.setAttribute('data-cmp-reject-all', '');
    el.textContent = 'No';
    document.body.appendChild(el);
    bindDataAttributes({ open: vi.fn(), acceptAll: vi.fn(), rejectAll });
    el.click();
    expect(rejectAll).toHaveBeenCalled();
  });
});
