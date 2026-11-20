import { STORAGE_KEYS } from "../core/config.js";
import { storage } from "./storage.js";
import { getProduct } from "./catalog.js";

const LIMIT = 8;

function read() {
  const raw = storage.get(STORAGE_KEYS.recent, []);
  if (!Array.isArray(raw)) return [];
  const ids = [];
  raw.forEach((id) => {
    const product = getProduct(String(id));
    if (product && !ids.includes(product.id)) ids.push(product.id);
  });
  return ids.slice(0, LIMIT);
}

export function record(productId) {
  const product = getProduct(productId);
  if (!product) return;
  const next = [product.id, ...read().filter((id) => id !== product.id)].slice(0, LIMIT);
  storage.set(STORAGE_KEYS.recent, next);
}

export function recentProducts(excludeId = null, limit = 4) {
  return read()
    .filter((id) => id !== excludeId)
    .map((id) => getProduct(id))
    .filter(Boolean)
    .slice(0, limit);
}
