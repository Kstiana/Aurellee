import { BRAND, CURRENCIES } from "./config.js";

export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const lerp = (a, b, t) => a + (b - a) * t;
export const range = (value, inMin, inMax) => clamp((value - inMin) / (inMax - inMin), 0, 1);

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ESCAPES[char]);

export const slugify = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function debounce(fn, wait = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function throttleFrame(fn) {
  let queued = false;
  return (...args) => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...args);
    });
  };
}

export function formatMoney(amount, currency = BRAND.currency) {
  const config = CURRENCIES[currency] || CURRENCIES[BRAND.currency];
  const value = Number(amount) * config.rate;
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(BRAND.locale, { year: "numeric", month: "long", day: "numeric" }).format(date);
}

export function icon(name, className = "") {
  return `<i data-lucide="${esc(name)}"${className ? ` class="${esc(className)}"` : ""} aria-hidden="true"></i>`;
}

export function refreshIcons(scope) {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try {
      window.lucide.createIcons({ attrs: { "stroke-width": 1.5 }, nameAttr: "data-lucide" });
    } catch (error) {
      return;
    }
  }
}

export function lockScroll() {
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.paddingRight = scrollbar > 0 ? `${scrollbar}px` : "";
  document.body.classList.add("is-locked");
}

export function unlockScroll() {
  document.body.classList.remove("is-locked");
  document.body.style.paddingRight = "";
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapFocus(container) {
  const handler = (event) => {
    if (event.key !== "Tab") return;
    const items = qsa(FOCUSABLE, container).filter((node) => node.offsetParent !== null || node === document.activeElement);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  container.addEventListener("keydown", handler);
  return () => container.removeEventListener("keydown", handler);
}

export function announce(message) {
  let region = qs("#live-region");
  if (!region) {
    region = document.createElement("div");
    region.id = "live-region";
    region.className = "live-region";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    document.body.appendChild(region);
  }
  region.textContent = "";
  window.setTimeout(() => {
    region.textContent = message;
  }, 60);
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
}

export function onceVisible(nodes, callback, options = {}) {
  const list = Array.isArray(nodes) ? nodes : [nodes];
  if (!("IntersectionObserver" in window)) {
    list.forEach((node) => callback(node));
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        callback(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12, ...options }
  );
  list.forEach((node) => observer.observe(node));
  return () => observer.disconnect();
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function safeJSON(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
}
