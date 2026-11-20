import { STORAGE_KEYS } from "../core/config.js";
import { storage } from "./storage.js";
import { getProduct } from "./catalog.js";

const subscribers = new Set();

function sanitise(raw) {
  if (!Array.isArray(raw)) return [];
  const ids = [];
  raw.forEach((id) => {
    const product = getProduct(String(id));
    if (product && !ids.includes(product.id)) ids.push(product.id);
  });
  return ids;
}

let ids = sanitise(storage.get(STORAGE_KEYS.wishlist, []));

function notify() {
  subscribers.forEach((callback) => {
    try {
      callback(ids.slice());
    } catch (error) {
      return;
    }
  });
}

storage.subscribe(STORAGE_KEYS.wishlist, (value) => {
  const next = sanitise(value);
  if (JSON.stringify(next) === JSON.stringify(ids)) return;
  ids = next;
  notify();
});

export const list = () => ids.slice();
export const has = (id) => ids.includes(id);
export const count = () => ids.length;

export function toggle(id) {
  const product = getProduct(id);
  if (!product) return { ok: false, saved: false };
  const saved = !ids.includes(product.id);
  ids = saved ? [...ids, product.id] : ids.filter((entry) => entry !== product.id);
  storage.set(STORAGE_KEYS.wishlist, ids);
  notify();
  return { ok: true, saved, product };
}

export function remove(id) {
  ids = ids.filter((entry) => entry !== id);
  storage.set(STORAGE_KEYS.wishlist, ids);
  notify();
}

export function subscribe(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}
