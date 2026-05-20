import "@testing-library/jest-dom/vitest";

const store = new Map();

Object.defineProperty(window, "localStorage", {
  value: {
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
  },
  writable: true,
});
