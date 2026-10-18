// Small persistent store (localStorage, silently in-memory when storage is blocked).
const mem = {};
export const store = {
  get(k) { try { return JSON.parse(localStorage.getItem('breach.' + k)); } catch { return mem[k] ?? null; } },
  set(k, v) { mem[k] = v; try { localStorage.setItem('breach.' + k, JSON.stringify(v)); } catch { /* private mode */ } },
};
