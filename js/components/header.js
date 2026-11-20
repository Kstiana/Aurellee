import { BRAND, ROUTES } from "../core/config.js";
import { isActivePath } from "../core/router.js";
import { esc, icon, lockScroll, prefersReducedMotion, qs, qsa, refreshIcons, throttleFrame, trapFocus, unlockScroll, isFinePointer } from "../core/utils.js";
import { IMG, pexelsUrl, srcset } from "../data/images.js";
import { NAV_DESTINATIONS } from "../data/categories.js";
import * as cart from "../services/cart.js";
import * as wishlist from "../services/wishlist.js";
import { createSearch } from "./search.js";
import { showToast } from "./toast.js";

const ANNOUNCEMENTS = [
  "AURELLE is a demonstration brand. Products and prices are illustrative.",
  "Add to your bag, then send your order request by WhatsApp.",
  "Enquiries from anywhere in the world are welcome."
];

const MENU_LINKS = [
  { label: "Shop all", href: ROUTES.shop, note: "The full edit", image: IMG.menu.shop },
  { label: "Haircare", href: ROUTES.collection("haircare"), note: "Wash, condition, treat", image: IMG.categories.haircare },
  { label: "Styling", href: ROUTES.collection("styling"), note: "Prepare and protect", image: IMG.categories.styling },
  { label: "Wigs & Extensions", href: ROUTES.collection("wigs-extensions"), note: "Wigs and bundles", image: IMG.categories.wigs },
  { label: "Accessories", href: ROUTES.collection("accessories"), note: "Sleep and tools", image: IMG.categories.accessories },
  { label: "Journal", href: ROUTES.journal, note: "Read and learn", image: IMG.menu.journal },
  { label: "About", href: ROUTES.about, note: "Our approach", image: IMG.menu.about },
  { label: "Contact", href: ROUTES.contact, note: "Say hello", image: IMG.menu.contact }
];

const SHOP_BY = [
  { label: "New in", href: `${ROUTES.shop}?sort=newest` },
  { label: "Bestsellers", href: `${ROUTES.shop}?sort=featured` },
  { label: "Wash & Care", href: `${ROUTES.collection("haircare")}?category=wash-care` },
  { label: "Treatments", href: `${ROUTES.collection("haircare")}?category=treatments` },
  { label: "Under $30", href: `${ROUTES.shop}?max=30` }
];

const isShopArea = () => ["/shop", "/collections", "/product"].some((path) => window.location.pathname.startsWith(path));

function current(href) {
  const target = href.split("?")[0];
  return isActivePath(target) ? ' aria-current="page"' : "";
}

function markup() {
  const menuItems = MENU_LINKS.map(
    (link, index) => `
      <li class="menu__item">
        <a class="menu__link" href="${link.href}" style="--i:${index}" data-menu-link data-index="${index}"${current(link.href)}>
          <span>${esc(link.label)}</span>
          <span class="t-caption">${esc(link.note)}</span>
        </a>
      </li>`
  ).join("");

  const menuImages = MENU_LINKS.map(
    (link, index) => `<img data-src="${esc(pexelsUrl(link.image.id, 900))}" data-srcset="${esc(srcset(link.image.id))}" sizes="26rem" alt="" width="900" height="1100" style="object-position:${esc(link.image.position)}"${index === 0 ? ' class="is-current"' : ""}>`
  ).join("");

  const mega = `
    <div class="mega" id="mega" data-mega>
      <div class="mega__panel">
        <a class="mega__feature" href="${ROUTES.shop}">
          <div class="media" data-img-id="${esc(IMG.menu.shop.id)}"><img src="${esc(pexelsUrl(IMG.menu.shop.id, 800))}" srcset="${esc(srcset(IMG.menu.shop.id))}" sizes="22rem" alt="" width="800" height="1000" loading="lazy" decoding="async" style="object-position:${esc(IMG.menu.shop.position)}"></div>
          <span class="mega__feature-copy">
            <span class="t-subheading" style="display:block">The AURELLE edit</span>
            <span class="t-small" style="color:var(--ivory)">Ten pieces for a considered ritual</span>
          </span>
        </a>
        <div class="mega__col">
          <p class="mega__title">Collections</p>
          ${NAV_DESTINATIONS.map((item) => `<a class="mega__link" href="${item.href}"><span>${esc(item.label)}</span><span class="t-caption">${esc(item.note)}</span></a>`).join("")}
        </div>
        <div class="mega__col">
          <p class="mega__title">Shop by</p>
          ${SHOP_BY.map((item) => `<a class="mega__link" href="${item.href}"><span>${esc(item.label)}</span>${icon("arrow-up-right")}</a>`).join("")}
        </div>
      </div>
    </div>`;

  return `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="announce" role="region" aria-label="Announcements">
      <div class="announce__track" data-announce>
        ${ANNOUNCEMENTS.map((text, index) => `<p class="announce__item${index === 0 ? " is-active" : ""}">${esc(text)}</p>`).join("")}
      </div>
    </div>
    <header class="site-header" id="site-header" data-header>
      <div class="site-header__bar">
        <div class="site-header__start">
          <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
            <span class="menu-btn__lines" aria-hidden="true"><span></span><span></span><span></span></span>
            <span class="menu-btn__label" aria-hidden="true"><span>Menu</span><span>Close</span></span>
            <span class="visually-hidden" data-menu-label>Open menu</span>
          </button>
          <nav class="primary-nav" aria-label="Primary">
            <ul class="primary-nav__list">
              <li>
                <button class="primary-nav__link" type="button" aria-expanded="false" aria-controls="mega" data-mega-toggle${isShopArea() ? ' aria-current="page"' : ""}>
                  <span>Shop</span>${icon("chevron-down", "primary-nav__chev")}
                </button>
              </li>
              <li><a class="primary-nav__link" href="${ROUTES.journal}"${current(ROUTES.journal)}>Journal</a></li>
              <li><a class="primary-nav__link" href="${ROUTES.about}"${current(ROUTES.about)}>About</a></li>
            </ul>
          </nav>
        </div>
        <a class="wordmark" href="${ROUTES.home}" aria-label="${esc(BRAND.name)} home">${esc(BRAND.name)}</a>
        <div class="site-header__end">
          <button class="icon-btn" type="button" aria-label="Search" aria-haspopup="dialog" data-search-open>${icon("search")}</button>
          <button class="icon-btn has-tip" type="button" aria-label="Account, coming soon" aria-disabled="true" data-account>
            ${icon("user")}<span class="tooltip-soon" aria-hidden="true">Accounts coming soon</span>
          </button>
          <a class="icon-btn" href="${ROUTES.cart}#saved" aria-label="Saved items, 0" data-wish-link>
            ${icon("heart")}<span class="icon-btn__badge" data-wish-count data-count="0" aria-hidden="true">0</span>
          </a>
          <a class="icon-btn" href="${ROUTES.cart}" aria-label="Bag, 0 items" data-cart-link>
            ${icon("shopping-bag")}<span class="icon-btn__badge" data-cart-count data-count="0" aria-hidden="true">0</span>
          </a>
        </div>
      </div>
      ${mega}
    </header>
    <div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Site menu" aria-hidden="true" data-menu>
      <div class="menu__panel menu__panel--blush"></div>
      <div class="menu__panel menu__panel--rose"></div>
      <div class="menu__panel menu__panel--mocha"></div>
      <div class="menu__inner">
        <div class="menu__body">
          <ul class="menu__list">${menuItems}</ul>
          <div class="menu__media" aria-hidden="true"><div class="menu__stack">${menuImages}</div></div>
        </div>
        <div class="menu__foot">
          <p>${esc(BRAND.tagline)}</p>
          <p><a href="${ROUTES.cart}#saved">Saved items</a> &nbsp;·&nbsp; <a href="${ROUTES.faq}">FAQ</a> &nbsp;·&nbsp; <a href="${ROUTES.shipping}">Shipping &amp; returns</a> &nbsp;·&nbsp; <a href="mailto:${esc(BRAND.email)}">${esc(BRAND.email)}</a></p>
        </div>
      </div>
    </div>
    <div class="scroll-progress" aria-hidden="true" data-progress></div>`;
}

export function initHeader() {
  const holder = document.createElement("div");
  holder.innerHTML = markup();
  const fragment = document.createDocumentFragment();
  while (holder.firstChild) fragment.appendChild(holder.firstChild);
  document.body.prepend(fragment);
  refreshIcons();

  const root = document.documentElement;
  const header = qs("[data-header]");
  const announce = qs(".announce");
  const menu = qs("[data-menu]");
  const menuButton = qs("[data-menu-toggle]");
  const menuLabel = qs("[data-menu-label]");
  const mega = qs("[data-mega]");
  const megaButton = qs("[data-mega-toggle]");
  const progress = qs("[data-progress]");
  const search = createSearch();
  const inertTargets = () => qsa("main, .site-footer, .announce").filter(Boolean);

  let menuOpen = false;
  let megaOpen = false;
  let releaseTrap = null;
  let closeTimer = null;
  let imagesLoaded = false;

  const setCounts = () => {
    const bag = cart.count();
    const saved = wishlist.count();
    const bagBadge = qs("[data-cart-count]");
    const savedBadge = qs("[data-wish-count]");
    if (bagBadge) {
      const changed = bagBadge.dataset.count !== String(bag);
      bagBadge.textContent = bag > 99 ? "99+" : String(bag);
      bagBadge.dataset.count = String(bag);
      if (changed && bag > 0) {
        bagBadge.classList.remove("is-bump");
        void bagBadge.offsetWidth;
        bagBadge.classList.add("is-bump");
      }
    }
    if (savedBadge) {
      savedBadge.textContent = String(saved);
      savedBadge.dataset.count = String(saved);
    }
    const cartLink = qs("[data-cart-link]");
    const wishLink = qs("[data-wish-link]");
    if (cartLink) cartLink.setAttribute("aria-label", `Bag, ${bag} ${bag === 1 ? "item" : "items"}`);
    if (wishLink) wishLink.setAttribute("aria-label", `Saved items, ${saved}`);
  };

  setCounts();
  cart.subscribe(setCounts);
  wishlist.subscribe(setCounts);

  const loadMenuImages = () => {
    if (imagesLoaded) return;
    imagesLoaded = true;
    qsa(".menu__media img[data-src]").forEach((img) => {
      img.srcset = img.dataset.srcset;
      img.src = img.dataset.src;
    });
  };
  
    menuButton.addEventListener("pointerenter", loadMenuImages, { once: true });
  menuButton.addEventListener("focus", loadMenuImages, { once: true });
  if ("requestIdleCallback" in window) window.requestIdleCallback(loadMenuImages, { timeout: 4000 });
  else window.setTimeout(loadMenuImages, 2500);

  const onScroll = throttleFrame(() => {
    const y = Math.max(window.scrollY, 0);
    const announceHeight = announce ? announce.offsetHeight : 0;
    root.style.setProperty("--shift", `${Math.min(y, announceHeight)}px`);
    header.classList.toggle("is-solid", y > 12);
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty("--progress", total > 0 ? String(Math.min(y / total, 1)) : "0");
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  const originFromButton = () => {
    const rect = menuButton.getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    menu.style.setProperty("--origin-x", `${x.toFixed(1)}%`);
    menu.style.setProperty("--origin-y", `${y.toFixed(1)}%`);
  };

  const openMenu = () => {
    if (menuOpen) return;
    closeMega(true);
    menuOpen = true;
    loadMenuImages();
    originFromButton();
    menu.classList.remove("is-closing");
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    header.classList.add("menu-open");
    menuButton.setAttribute("aria-expanded", "true");
    menuLabel.textContent = "Close menu";
    lockScroll();
    inertTargets().forEach((node) => node.setAttribute("inert", ""));
    releaseTrap = trapFocus(menu);
    const delay = prefersReducedMotion() ? 0 : 750;
    window.setTimeout(() => {
      if (!menuOpen) return;
      const first = qs("[data-menu-link]", menu);
      if (first) first.focus({ preventScroll: true });
    }, delay);
  };

  const closeMenu = () => {
    if (!menuOpen) return;
    menuOpen = false;
    menu.classList.remove("is-open");
    menu.classList.add("is-closing");
    menu.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    menuLabel.textContent = "Open menu";
    inertTargets().forEach((node) => node.removeAttribute("inert"));
    unlockScroll();
    if (releaseTrap) releaseTrap();
    window.setTimeout(() => {
      header.classList.remove("menu-open");
    }, 450);
    window.setTimeout(() => menu.classList.remove("is-closing"), 1300);
    menuButton.focus({ preventScroll: true });
  };

  menuButton.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));

  qsa("[data-menu-link]", menu).forEach((link) => {
    const show = () => {
      const index = Number(link.dataset.index);
      qsa(".menu__media img", menu).forEach((img, position) => img.classList.toggle("is-current", position === index));
    };
    link.addEventListener("mouseenter", show);
    link.addEventListener("focus", show);
    link.addEventListener("click", () => {
      if (menuOpen) {
        unlockScroll();
        inertTargets().forEach((node) => node.removeAttribute("inert"));
      }
    });
  });

  function openMega() {
    if (!mega || megaOpen || menuOpen) return;
    window.clearTimeout(closeTimer);
    megaOpen = true;
    mega.classList.add("is-open");
    megaButton.setAttribute("aria-expanded", "true");
    header.classList.add("is-solid");
  }

  function closeMega(immediate = false) {
    if (!mega || !megaOpen) return;
    window.clearTimeout(closeTimer);
    const run = () => {
      megaOpen = false;
      mega.classList.remove("is-open");
      megaButton.setAttribute("aria-expanded", "false");
      onScroll();
    };
    if (immediate) run();
    else closeTimer = window.setTimeout(run, 140);
  }

  if (megaButton) {
    megaButton.addEventListener("click", () => (megaOpen ? closeMega(true) : openMega()));
    if (isFinePointer()) {
      const zone = megaButton.closest("li");
      zone.addEventListener("mouseenter", openMega);
      zone.addEventListener("mouseleave", () => closeMega());
      mega.addEventListener("mouseenter", () => window.clearTimeout(closeTimer));
      mega.addEventListener("mouseleave", () => closeMega());
    }
    document.addEventListener("click", (event) => {
      if (!megaOpen) return;
      if (event.target.closest("[data-mega]") || event.target.closest("[data-mega-toggle]")) return;
      closeMega(true);
    });
    mega.addEventListener("focusout", (event) => {
      if (!megaOpen) return;
      if (!mega.contains(event.relatedTarget) && event.relatedTarget !== megaButton) closeMega();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (menuOpen) closeMenu();
    else if (megaOpen) {
      closeMega(true);
      megaButton.focus();
    }
  });

  qs("[data-search-open]").addEventListener("click", (event) => {
    closeMega(true);
    search.open(event.currentTarget);
  });

  qs("[data-account]").addEventListener("click", () => {
    showToast("Customer accounts are coming soon.");
  });

  const items = qsa(".announce__item");
  if (items.length > 1 && !prefersReducedMotion()) {
    let index = 0;
    window.setInterval(() => {
      const leaving = items[index];
      index = (index + 1) % items.length;
      leaving.classList.remove("is-active");
      leaving.classList.add("is-leaving");
      window.setTimeout(() => leaving.classList.remove("is-leaving"), 600);
      items[index].classList.add("is-active");
    }, 5200);
  }

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      if (menuOpen) closeMenu();
      setCounts();
    }
  });

  return { openMenu, closeMenu, openSearch: search.open };
}
