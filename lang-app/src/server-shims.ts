/**
 * Shim các browser API mà code dùng trực tiếp (localStorage, matchMedia)
 * để SSR / prerender không crash trên Node. Giá trị server không quan trọng:
 * client sẽ hydrate và đọc localStorage thật trên trình duyệt.
 */
const g = globalThis as any;

if (typeof g.localStorage === 'undefined') {
  const store = new Map<string, string>();
  g.localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
  };
}

if (typeof g.matchMedia === 'undefined') {
  g.matchMedia = () => ({
    matches: false,
    media: '',
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  });
}
