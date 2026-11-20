import { BRAND } from "../core/config.js";
import { formatMoney } from "../core/utils.js";
import { validateCart } from "./cart.js";

const MAX_NOTE = 300;

function cleanNote(note) {
  return String(note || "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NOTE);
}

function link(message) {
  return `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildOrderMessage(snapshot, note = "") {
  const lines = snapshot.items.map((item, index) => {
    const variant = item.product.variants.length > 1 || item.variant.label ? ` (${item.variant.label})` : "";
    return `${index + 1}. ${item.product.name}${variant} x ${item.qty} - ${formatMoney(item.unit)} each, ${formatMoney(item.line)}`;
  });
  const parts = [
    `Hello ${BRAND.name}, I would like to place an order:`,
    "",
    ...lines,
    "",
    `Subtotal: ${formatMoney(snapshot.subtotal)} ${BRAND.currency}`
  ];
  const safeNote = cleanNote(note);
  if (safeNote) parts.push(`Note: ${safeNote}`);
  parts.push("", "This is an order request. Please confirm availability and delivery details. Thank you.");
  return parts.join("\n");
}

export function buildOrder(note = "") {
  const result = validateCart();
  if (!result.ok) return { ok: false, message: result.message };
  const message = buildOrderMessage(result.snapshot, note);
  return { ok: true, message, url: link(message) };
}

export function buildEnquiry(product, variant, qty = 1) {
  const label = variant ? ` (${variant.label})` : "";
  const amount = Math.max(1, Math.floor(Number(qty)) || 1);
  const message = `Hello ${BRAND.name}, I would like to ask about ${product.name}${label}, quantity ${amount}. Is it available, and how soon could it be delivered?`;
  return { message, url: link(message) };
}

export function buildGeneral(text = "") {
  const message = text || `Hello ${BRAND.name}, I have a question about your collection.`;
  return { message, url: link(message) };
}
