import { STORAGE_KEYS } from "./config.js";
import { prefersReducedMotion } from "./utils.js";

const NAV_FLAG = "aurelle.nav.transition";

export const getParams = () => new URLSearchParams(window.location.search);

export function getSlug(base) {
  const parts = window.location.pathname
    .replace(/\/+$/, "")
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/\.html$/, ""));
  const index = parts.indexOf(base);
  if (index >= 0 && parts[index + 1]) {
    try {
      return decodeURIComponent(parts[index + 1]);
    } catch (error) {
      return parts[index + 1];
    }
  }
  return getParams().get("slug");
}

export function setParams(updates, { replace = true } = {}) {
  const params = getParams();
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "" || (Array.isArray(value) && !value.length)) {
      params.delete(key);
    } else {
      params.set(key, Array.isArray(value) ? value.join(",") : String(value));
    }
  });
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history[replace ? "replaceState" : "pushState"](null, "", url);
}

export function isActivePath(href) {
  const clean = (path) => path.replace(/\/index\.html$/, "/").replace(/\.html$/, "").replace(/\/+$/, "") || "/";
  const current = clean(window.location.pathname);
  const target = clean(new URL(href, window.location.origin).pathname);
  if (target === "/") return current === "/";
  return current === target || current.startsWith(`${target}/`);
}

const LOCAL_HOST = /^(localhost|127(\.\d{1,3}){3}|\[?::1\]?|10(\.\d{1,3}){3}|192\.168(\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[01])(\.\d{1,3}){2}|.+\.local)$/;

const PAGE_FILES = {
  "/shop": "/shop.html",
  "/about": "/about.html",
  "/journal": "/journal.html",
  "/cart": "/cart.html",
  "/contact": "/contact.html",
  "/faq": "/faq.html",
  "/privacy": "/pages/privacy.html",
  "/terms": "/pages/terms.html",
  "/shipping-returns": "/pages/shipping-returns.html",
  "/collections/wigs-extensions": "/collections/wigs.html"
};

export const isLocalHost = (hostname = window.location.hostname) => LOCAL_HOST.test(hostname);

function withSlug(search, slug) {
  const query = new URLSearchParams(search);
  let value = slug;
  try {
    value = decodeURIComponent(slug);
  } catch (error) {
    value = slug;
  }
  query.set("slug", value);
  return `?${query.toString()}`;
}

export function toLocalHref(href) {
  if (typeof href !== "string" || !href.startsWith("/") || href.startsWith("//")) return href;
  const match = href.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  if (!match) return href;
  const path = match[1].replace(/\/+$/, "") || "/";
  const search = match[2] || "";
  const hash = match[3] || "";
  if (/\.html$/.test(path)) return href;

  const product = path.match(/^\/product\/([^/]+)$/);
  if (product) return `/product.html${withSlug(search, product[1])}${hash}`;

  const article = path.match(/^\/journal\/([^/]+)$/);
  if (article) return `/article.html${withSlug(search, article[1])}${hash}`;

  if (PAGE_FILES[path]) return `${PAGE_FILES[path]}${search}${hash}`;

  const collection = path.match(/^\/collections\/([^/]+)$/);
  if (collection) return `/collections/${collection[1]}.html${search}${hash}`;

  return href;
}

function resolveElement(element) {
  ["href", "action"].forEach((attribute) => {
    const value = element.getAttribute(attribute);
    if (!value || !value.startsWith("/")) return;
    const next = toLocalHref(value);
    if (next !== value) element.setAttribute(attribute, next);
  });
}

function resolveTree(node) {
  if (node.nodeType !== 1) return;
  if (node.matches("a[href], form[action]")) resolveElement(node);
  node.querySelectorAll('a[href^="/"], form[action^="/"]').forEach(resolveElement);
}

function initLinkResolution() {
  if (!isLocalHost()) return;
  resolveTree(document.documentElement);
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes") resolveTree(mutation.target);
      else mutation.addedNodes.forEach(resolveTree);
    });
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href", "action"] });
}

function ensureCurtain() {
  let curtain = document.querySelector(".curtain");
  if (!curtain) {
    curtain = document.createElement("div");
    curtain.className = "curtain";
    curtain.setAttribute("aria-hidden", "true");
    document.body.appendChild(curtain);
  }
  return curtain;
}

function resetCurtain(curtain) {
  curtain.classList.add("is-reset");
  curtain.classList.remove("is-in", "is-out");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => curtain.classList.remove("is-reset"));
  });
}

function isInternalNavigation(link, event) {
  if (!link || event.defaultPrevented) return false;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (link.target && link.target !== "_self") return false;
  if (link.hasAttribute("download")) return false;
  const href = link.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return false;
  let url;
  try {
    url = new URL(link.href, window.location.href);
  } catch (error) {
    return false;
  }
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return false;
  return true;
}

export function initPageTransitions() {
  initLinkResolution();
  const curtain = ensureCurtain();

  if (prefersReducedMotion()) {
    curtain.remove();
    return;
  }

  let arrivedWithCurtain = false;
  try {
    arrivedWithCurtain = sessionStorage.getItem(NAV_FLAG) === "1";
    sessionStorage.removeItem(NAV_FLAG);
  } catch (error) {
    arrivedWithCurtain = false;
  }

  if (arrivedWithCurtain) {
    curtain.classList.add("is-reset", "is-in");
    curtain.classList.remove("is-reset");
    curtain.style.transition = "none";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        curtain.style.transition = "";
        curtain.classList.remove("is-in");
        curtain.classList.add("is-out");
        window.setTimeout(() => resetCurtain(curtain), 800);
      });
    });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!isInternalNavigation(link, event)) return;
    event.preventDefault();
    const destination = link.href;
    try {
      sessionStorage.setItem(NAV_FLAG, "1");
    } catch (error) {
      window.location.assign(destination);
      return;
    }
    curtain.classList.add("is-in");
    window.setTimeout(() => window.location.assign(destination), 650);
  });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) resetCurtain(curtain);
  });
}

export function runLoader() {
  const root = document.documentElement;
  const finish = () => {
    root.classList.remove("needs-loader");
    root.classList.add("is-ready");
    window.dispatchEvent(new CustomEvent("aurelle:ready"));
  };

  let seen = false;
  try {
    seen = sessionStorage.getItem(STORAGE_KEYS.preloader) === "1";
  } catch (error) {
    seen = false;
  }

  if (seen || prefersReducedMotion() || !root.classList.contains("needs-loader")) {
    finish();
    return;
  }

  const loader = document.createElement("div");
  loader.className = "loader";
  loader.setAttribute("aria-hidden", "true");
  loader.innerHTML = `
    <div class="loader__inner">
      <svg class="loader__mark" viewBox="0 0 100 100" aria-hidden="true">
        <path pathLength="1" d="M26 74 50 24l24 50"/>
        <path pathLength="1" d="M36 58h28"/>
      </svg>
      <span class="loader__word">AURELLE</span>
    </div>`;
  document.body.appendChild(loader);
  root.classList.remove("needs-loader");

  try {
    sessionStorage.setItem(STORAGE_KEYS.preloader, "1");
  } catch (error) {
    seen = true;
  }

  window.setTimeout(() => {
    loader.classList.add("is-done");
    window.setTimeout(() => {
      loader.remove();
    }, 1300);
    window.setTimeout(finish, 650);
  }, 2000);
}
