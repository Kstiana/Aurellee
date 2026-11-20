import { CART_LIMITS, STORAGE_KEYS } from "../core/config.js";
import { clamp } from "../core/utils.js";
import { storage } from "./storage.js";
import { getProduct, getVariant } from "./catalog.js";

const subscribers = new Set();

const lineKey = (productId, variantId) => `${productId}::${variantId}`;

function sanitise(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const lines = [];
  raw.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const product = getProduct(String(entry.productId || ""));
    if (!product) return;
    const variant = getVariant(product, String(entry.variantId || ""));
    if (!variant) return;
    const key = lineKey(product.id, variant.id);
    if (seen.has(key)) return;
    const qty = Math.floor(Number(entry.qty));
    if (!Number.isFinite(qty) || qty < CART_LIMITS.minQty) return;
    seen.add(key);
    lines.push({ productId: product.id, variantId: variant.id, qty: clamp(qty, CART_LIMITS.minQty, CART_LIMITS.maxQty) });
  });
  return lines.slice(0, CART_LIMITS.maxLines);
}

let lines = sanitise(storage.get(STORAGE_KEYS.cart, []));

function persist() {
  storage.set(STORAGE_KEYS.cart, lines);
  const snapshot = detail();
  subscribers.forEach((callback) => {
    try {
      callback(snapshot);
    } catch (error) {
      return;
    }
  });
}

storage.subscribe(STORAGE_KEYS.cart, (value) => {
  const next = sanitise(value);
  if (JSON.stringify(next) === JSON.stringify(lines)) return;
  lines = next;
  const snapshot = detail();
  subscribers.forEach((callback) => callback(snapshot));
});

export function detail() {
  const items = lines.map((line) => {
    const product = getProduct(line.productId);
    const variant = getVariant(product, line.variantId);
    const unit = variant.price;
    return {
      key: lineKey(product.id, variant.id),
      product,
      variant,
      qty: line.qty,
      unit,
      line: Math.round(unit * line.qty * 100) / 100,
      unavailable: !variant.available
    };
  });
  const payable = items.filter((item) => !item.unavailable);
  const subtotal = Math.round(payable.reduce((sum, item) => sum + item.line, 0) * 100) / 100;
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  return { items, subtotal, count, hasUnavailable: payable.length !== items.length };
}

export function validateInput(productId, variantId, qty) {
  const product = getProduct(productId);
  if (!product) return { ok: false, message: "This product is no longer available." };
  const variant = getVariant(product, variantId);
  if (!variant) return { ok: false, message: `Please choose a ${product.optionName.toLowerCase()}.` };
  if (!variant.available) return { ok: false, message: `${variant.label} is currently unavailable.` };
  const amount = Math.floor(Number(qty));
  if (!Number.isFinite(amount) || amount < CART_LIMITS.minQty) return { ok: false, message: "Please choose a valid quantity." };
  if (amount > CART_LIMITS.maxQty) return { ok: false, message: `You can order up to ${CART_LIMITS.maxQty} of each item.` };
  return { ok: true, product, variant, qty: amount };
}

export function add(productId, variantId, qty = 1) {
  const check = validateInput(productId, variantId, qty);
  if (!check.ok) return check;
  const existing = lines.find((line) => line.productId === check.product.id && line.variantId === check.variant.id);
  if (existing) {
    const combined = existing.qty + check.qty;
    if (combined > CART_LIMITS.maxQty) {
      return { ok: false, message: `You can order up to ${CART_LIMITS.maxQty} of each item.` };
    }
    existing.qty = combined;
  } else {
    if (lines.length >= CART_LIMITS.maxLines) {
      return { ok: false, message: `Your bag holds up to ${CART_LIMITS.maxLines} different items.` };
    }
    lines.push({ productId: check.product.id, variantId: check.variant.id, qty: check.qty });
  }
  persist();
  return { ok: true, product: check.product, variant: check.variant, qty: check.qty };
}

export function setQty(productId, variantId, qty) {
  const line = lines.find((entry) => entry.productId === productId && entry.variantId === variantId);
  if (!line) return { ok: false, message: "That item is not in your bag." };
  const amount = Math.floor(Number(qty));
  if (!Number.isFinite(amount)) return { ok: false, message: "Please choose a valid quantity." };
  if (amount < CART_LIMITS.minQty) return remove(productId, variantId);
  line.qty = clamp(amount, CART_LIMITS.minQty, CART_LIMITS.maxQty);
  persist();
  return { ok: true };
}

export function remove(productId, variantId) {
  const before = lines.length;
  lines = lines.filter((line) => !(line.productId === productId && line.variantId === variantId));
  if (lines.length === before) return { ok: false, message: "That item is not in your bag." };
  persist();
  return { ok: true };
}

export function clear() {
  lines = [];
  persist();
}

export function validateCart() {
  const snapshot = detail();
  if (!snapshot.items.length) return { ok: false, message: "Your bag is empty." };
  if (snapshot.hasUnavailable) return { ok: false, message: "Some items are no longer available. Please remove them to continue." };
  if (snapshot.subtotal <= 0) return { ok: false, message: "Your bag total could not be calculated." };
  return { ok: true, snapshot };
}

export function count() {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export function subscribe(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}
