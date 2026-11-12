import '@testing-library/jest-dom/vitest';

// GridStack usa ResizeObserver para medir; jsdom no lo implementa.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
