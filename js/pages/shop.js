import { boot } from "../core/app.js";
import { ROUTES } from "../core/config.js";
import { applySEO, breadcrumbLD, injectJSONLD } from "../core/seo.js";
import { esc, icon, qs, refreshIcons } from "../core/utils.js";
import { COLLECTIONS } from "../data/categories.js";
import { IMG } from "../data/images.js";
import { mediaHTML } from "../components/media.js";
import { mountFilters } from "../components/filters.js";
import { initReveals } from "../components/motion.js";
import { renderGrid } from "../components/product-card.js";
import { getAllProducts, getCollection, productsInCollection } from "../services/catalog.js";

boot();

const slug = document.body.dataset.collection || "";
const collection = slug ? getCollection(slug) : null;
const base = collection ? productsInCollection(collection.slug) : getAllProducts();

const grid = qs("#shop-grid");
const results = qs("#shop-results");
const filtersRoot = qs("#shop-filters");
const tabs = qs("[data-collection-tabs]");
const heroMedia = qs("[data-collection-media]");
const editorial = qs("[data-collection-editorial]");

const trail = collection
  ? [
      { label: "Home", href: ROUTES.home },
      { label: "Shop", href: ROUTES.shop },
      { label: collection.title, href: ROUTES.collection(collection.slug) }
    ]
  : [
      { label: "Home", href: ROUTES.home },
      { label: "Shop", href: ROUTES.shop }
    ];

if (collection) {
  applySEO({ title: collection.metaTitle, description: collection.metaDescription, path: ROUTES.collection(collection.slug) });
} else {
  applySEO({
    title: "Shop All | AURELLE",
    description: "Browse the full AURELLE collection: haircare, treatments, styling, wigs, extensions and accessories, with simple filters and sorting.",
    path: ROUTES.shop
  });
}
injectJSONLD("ld-breadcrumb", breadcrumbLD(trail));

if (tabs) {
  const items = [{ label: "All", href: ROUTES.shop }, ...COLLECTIONS.map((item) => ({ label: item.title, href: ROUTES.collection(item.slug) }))];
  tabs.innerHTML = items
    .map((item) => {
      const active = collection ? item.href === ROUTES.collection(collection.slug) : item.href === ROUTES.shop;
      return `<a class="chip${active ? " is-active" : ""}" href="${item.href}"${active ? ' aria-current="page"' : ""}>${esc(item.label)}</a>`;
    })
    .join("");
}

if (heroMedia) {
  const slot = collection ? IMG.collections[collection.banner] : IMG.menu.shop;
  heroMedia.innerHTML = mediaHTML(slot, { sizes: "(min-width: 768px) 24rem, 22rem", eager: true, width: 800, height: 900, priority: true });
}

if (editorial && collection) {
  const others = COLLECTIONS.filter((item) => item.slug !== collection.slug);
  editorial.innerHTML = `
    <div class="container collection-editorial">
      <div class="collection-editorial__media" data-reveal="arch">${mediaHTML(IMG.collections[collection.banner], { sizes: "(min-width: 768px) 28rem, 90vw", width: 900, height: 1100 })}</div>
      <div class="collection-editorial__copy">
        <h2 class="t-title" data-reveal="up">${esc(collection.editorial.title)}</h2>
        <p class="t-body" data-reveal="up">${esc(collection.editorial.text)}</p>
        <a class="btn btn--ghost" href="${collection.editorial.link.href}" data-reveal="up" style="justify-self:start"><span class="btn__label">${esc(collection.editorial.link.label)}</span>${icon("arrow-right", "btn__icon")}</a>
        <nav class="related-collections" aria-label="More collections" data-reveal="up">
          ${others.map((item) => `<a href="${ROUTES.collection(item.slug)}"><span>${esc(item.title)}</span>${icon("arrow-up-right")}</a>`).join("")}
        </nav>
      </div>
    </div>`;
  refreshIcons();
  initReveals(editorial);
}

let token = 0;
let rendered = false;

function paint(list, state, reset) {
  if (!list.length) {
    const message = state.q
      ? `Nothing matched “${esc(state.q)}” with your current filters. Try a different word or clear your filters.`
      : "Nothing matches your current filters. Try removing one or two to see more of the collection.";
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state__mark">${icon("search-x")}</div>
        <h2 class="t-heading">No pieces found</h2>
        <p class="t-body">${message}</p>
        <button class="btn" type="button" data-empty-reset><span class="btn__label">Reset filters</span></button>
      </div>`;
    refreshIcons();
    const button = qs("[data-empty-reset]", grid);
    if (button) button.addEventListener("click", reset);
    return;
  }
  renderGrid(grid, list, { eager: false });
  grid.querySelectorAll("[data-product-card]").forEach((card, index) => {
    if (index < 4) card.querySelectorAll("img").forEach((img) => img.setAttribute("loading", "eager"));
  });
}

mountFilters(filtersRoot, base, (list, state, reset) => {
  token += 1;
  const current = token;
  if (!rendered) {
    rendered = true;
    paint(list, state, reset);
    return;
  }
  results.classList.add("is-updating");
  window.setTimeout(() => {
    if (current !== token) return;
    paint(list, state, reset);
    results.classList.remove("is-updating");
  }, 200);
});
