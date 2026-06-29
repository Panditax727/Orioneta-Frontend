import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

function createMemoryStorage() {
  let store = {};

  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index) => Object.keys(store)[index] ?? null),
    get length() {
      return Object.keys(store).length;
    },
  };
}

Object.defineProperty(globalThis, "localStorage", {
  value: createMemoryStorage(),
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, "sessionStorage", {
  value: createMemoryStorage(),
  configurable: true,
  writable: true,
});

afterEach(() => {
  vi.restoreAllMocks();
  globalThis.localStorage?.clear();
  globalThis.sessionStorage?.clear();
});
