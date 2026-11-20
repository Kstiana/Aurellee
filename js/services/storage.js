import { safeJSON } from "../core/utils.js";

const memory = new Map();
const listeners = new Map();

function detect() {
  try {
    const probe = "__aurelle_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch (error) {
    return false;
  }
}

const persistent = detect();

function emit(key, value) {
  (listeners.get(key) || []).forEach((callback) => {
    try {
      callback(value);
    } catch (error) {
      return;
    }
  });
}

export const storage = {
  persistent,

  get(key, fallback = null) {
    if (!persistent) return memory.has(key) ? memory.get(key) : fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : safeJSON(raw, fallback);
    } catch (error) {
      return fallback;
    }
  },

  set(key, value) {
    if (!persistent) {
      memory.set(key, value);
      emit(key, value);
      return true;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      emit(key, value);
      return true;
    } catch (error) {
      memory.set(key, value);
      emit(key, value);
      return false;
    }
  },

  remove(key) {
    memory.delete(key);
    if (persistent) {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        return;
      }
    }
    emit(key, null);
  },

  subscribe(key, callback) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(callback);
    return () => listeners.get(key).delete(callback);
  }
};

window.addEventListener("storage", (event) => {
  if (!event.key || !listeners.has(event.key)) return;
  emit(event.key, event.newValue ? safeJSON(event.newValue, null) : null);
});
