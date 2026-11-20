import { ROUTES } from "../core/config.js";
import { esc, formatMoney, icon, qsa, refreshIcons } from "../core/utils.js";
import { categoryName, defaultVariant, hasPriceRange, isPurchasable, minPrice, productImages, getProduct } from "../services/catalog.js";
import * as cart from "../services/cart.js";
import * as wishlist from "../services/wishlist.js";
import { mediaHTML } from "./media.js";
import { showToast } from "./toast.js";

let quickViewHandler = null;

export function setQuickViewHandler(handler) {
  quickViewHandler = handler;
}

function badgesFor(product) {
  const badges = [];
  if (product.isNew) badges.push('<span class="badge">New</span>');
  if (product.availability === "made-to-order") badges.push('<span class="badge badge--blush">Made to order</span>');
  if (product.availability === "low-stock") badges.push('<span class="badge badge--blush">Low stock</span>');
  if (!isPurchasable(product)) badges.push('<span class="badge badge--mocha">Unavailable</span>');
  return badges.join("");
}

export function productCardHTML(product, options = {}) {
  const { index = 0, sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw", eager = false } = options;
  const images = productImages(product);
  const saved = wishlist.has(product.id);
  const purchasable = isPurchasable(product);
  const single = product.variants.filter((variant) => variant.available).length === 1;
  const price = `${hasPriceRange(product) ? '<span class="t-caption">From</span>' : ""}<span class="t-price">${esc(formatMoney(minPrice(product)))}</span>`;
  const short = product.name.replace("AURELLE ", "");

  let actionLabel = "Add";
  let actionAttr = "data-add";
  if (!purchasable) actionLabel = "Unavailable";
  else if (!single) {
    actionLabel = "Select";
    actionAttr = "data-quick";
  }

  return `
    <article class="product-card" data-product-card data-id="${esc(product.id)}" data-slug="${esc(product.slug)}" style="--i:${index}">
      <div class="product-card__media">
        <div class="product-card__badges">${badgesFor(product)}</div>
        <button class="product-card__wish" type="button" aria-pressed="${saved}" aria-label="${saved ? "Remove" : "Save"} ${esc(short)} ${saved ? "from" : "to"} saved items" data-wish="${esc(product.id)}">${icon("heart")}</button>
        ${mediaHTML(images[0], { sizes, eager, width: 800, height: 1000 })}
        <div class="product-card__img-alt">${mediaHTML(images[1], { sizes, width: 800, height: 1000 })}</div>
        <div class="product-card__actions">
          <button class="product-card__add" type="button" ${actionAttr}="${esc(product.id)}"${purchasable ? "" : " disabled"}>${icon(single || !purchasable ? "shopping-bag" : "sliders-horizontal")}<span>${actionLabel}</span></button>
          <button class="product-card__quick" type="button" data-quick="${esc(product.id)}" aria-label="Quick view ${esc(short)}">${icon("eye")}</button>
        </div>
      </div>
      <div class="product-card__body">
        <span class="product-card__cat">${esc(categoryName(product.category))}</span>
        <h3 class="product-card__name"><a href="${ROUTES.product(product.slug)}">${esc(short)}</a></h3>
        <p class="product-card__price">${price}</p>
      </div>
    </article>`;
}

function syncWishButtons() {
  qsa("[data-wish]").forEach((button) => {
    const id = button.dataset.wish;
    const saved = wishlist.has(id);
    const product = getProduct(id);
    const short = product ? product.name.replace("AURELLE ", "") : "item";
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", `${saved ? "Remove" : "Save"} ${short} ${saved ? "from" : "to"} saved items`);
  });
}

let bound = false;

export function bindProductCards() {
  if (bound) return;
  bound = true;

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add]");
    if (addButton) {
      const product = getProduct(addButton.dataset.add);
      if (!product) return;
      const variant = defaultVariant(product);
      const result = cart.add(product.id, variant.id, 1);
      if (!result.ok) {
        showToast(result.message, { type: "error" });
        return;
      }
      showToast(`${product.name.replace("AURELLE ", "")} added to your bag`, { action: { label: "View bag", href: ROUTES.cart } });
      return;
    }

    const quickButton = event.target.closest("[data-quick]");
    if (quickButton && quickViewHandler) {
      const product = getProduct(quickButton.dataset.quick);
      if (product) quickViewHandler(product, quickButton);
      return;
    }

    const wishButton = event.target.closest("[data-wish]");
    if (wishButton) {
      const result = wishlist.toggle(wishButton.dataset.wish);
      if (!result.ok) return;
      showToast(result.saved ? "Saved for later" : "Removed from saved items");
    }
  });

  wishlist.subscribe(syncWishButtons);
}

export function renderGrid(container, products, options = {}) {
  container.innerHTML = products.map((product, index) => productCardHTML(product, { ...options, index: options.stagger === false ? 0 : Math.min(index, 11) })).join("");
  refreshIcons();
}
