import { boot } from "../core/app.js";
import { BRAND, CART_LIMITS, ROUTES } from "../core/config.js";
import { applySEO } from "../core/seo.js";
import { announce, esc, formatMoney, icon, pluralize, qs, qsa, refreshIcons } from "../core/utils.js";
import { mediaHTML } from "../components/media.js";
import { productCardHTML } from "../components/product-card.js";
import { showToast } from "../components/toast.js";
import { getProduct, productImages } from "../services/catalog.js";
import * as cart from "../services/cart.js";
import * as wishlist from "../services/wishlist.js";
import { buildOrder } from "../services/whatsapp.js";

boot();

applySEO({
  title: "Your Bag | AURELLE",
  description: "Review your AURELLE bag, adjust quantities and send your order request by WhatsApp.",
  path: ROUTES.cart,
  noindex: true
});

const root = qs("#cart-root");
let note = "";
let clearArmed = false;
let clearTimer = null;
let fallbackUrl = "";

function itemHTML(item) {
  const short = item.product.name.replace("AURELLE ", "");
  const first = productImages(item.product)[0];
  const optionLabel = item.product.variants.length > 1 || item.variant.label ? `${item.product.optionName}: ${item.variant.label}` : "";
  return `
    <li class="cart-item" data-line="${esc(item.key)}" data-product="${esc(item.product.id)}" data-variant="${esc(item.variant.id)}">
      <a class="cart-item__media" href="${ROUTES.product(item.product.slug)}" aria-label="${esc(short)}">${mediaHTML(first, { sizes: "8.5rem", width: 480, height: 600 })}</a>
      <div class="cart-item__body">
        <h2 class="cart-item__name"><a href="${ROUTES.product(item.product.slug)}">${esc(short)}</a></h2>
        <p class="cart-item__variant">${esc(optionLabel)}</p>
        <p class="cart-item__unit">${esc(formatMoney(item.unit))} each</p>
        ${item.unavailable ? `<p class="cart-item__notice" role="alert">This option is currently unavailable. Please remove it to continue.</p>` : ""}
        <div class="cart-item__foot">
          <div class="qty qty--small" role="group" aria-label="Quantity for ${esc(short)}">
            <button class="qty__btn" type="button" data-step="-1" aria-label="Decrease quantity of ${esc(short)}">${icon("minus")}</button>
            <input class="qty__value" type="number" inputmode="numeric" min="${CART_LIMITS.minQty}" max="${CART_LIMITS.maxQty}" value="${item.qty}" aria-label="Quantity of ${esc(short)}" data-qty-input>
            <button class="qty__btn" type="button" data-step="1" aria-label="Increase quantity of ${esc(short)}"${item.qty >= CART_LIMITS.maxQty ? " disabled" : ""}>${icon("plus")}</button>
          </div>
          <span class="cart-item__line">${esc(formatMoney(item.line))}</span>
          <button class="cart-item__remove" type="button" data-remove aria-label="Remove ${esc(short)} from bag">Remove</button>
        </div>
      </div>
    </li>`;
}

function savedHTML() {
  const products = wishlist.list().map((id) => getProduct(id)).filter(Boolean);
  return `
    <section class="wishlist-section" id="saved" aria-labelledby="saved-title" tabindex="-1">
      <div class="section-head"><h2 class="t-title" id="saved-title">Saved for later</h2></div>
      ${
        products.length
          ? `<div class="product-grid">${products.map((product, index) => productCardHTML(product, { index })).join("")}</div>`
          : `<div class="empty-state" style="padding-block:var(--space-xl)"><div class="empty-state__mark">${icon("heart")}</div><p class="t-body">Tap the heart on any piece to keep it here.</p><a class="btn btn--ghost" href="${ROUTES.shop}"><span class="btn__label">Browse the collection</span></a></div>`
      }
    </section>`;
}

function emptyHTML() {
  return `
    <div class="cart-empty">
      <div class="cart-empty__mark">${icon("shopping-bag")}</div>
      <h1 class="t-title">Your bag is empty</h1>
      <p class="t-body">When you find something you love, it will wait for you here.</p>
      <a class="btn" href="${ROUTES.shop}"><span class="btn__label">Continue shopping</span>${icon("arrow-right", "btn__icon")}</a>
    </div>`;
}

function summaryHTML(snapshot) {
  const blocked = snapshot.hasUnavailable;
  return `
    <aside class="summary" aria-labelledby="summary-title">
      <h2 class="summary__title" id="summary-title">Order summary</h2>
      <div class="summary__rows">
        <div class="summary__row"><span>${pluralize(snapshot.count, "item")}</span><span>${esc(formatMoney(snapshot.subtotal))}</span></div>
        <div class="summary__row"><span>Delivery</span><span>Confirmed on WhatsApp</span></div>
        <div class="summary__row summary__row--total"><span>Subtotal</span><span data-subtotal>${esc(formatMoney(snapshot.subtotal))}</span></div>
      </div>
      <div class="field">
        <label class="field__label" for="order-note">Add a note (optional)</label>
        <textarea class="field__textarea" id="order-note" maxlength="300" rows="3" placeholder="Delivery city or country, or anything we should know" data-note style="min-height:6rem">${esc(note)}</textarea>
        <p class="field__hint">Your note is included in the WhatsApp message. Please do not share payment details.</p>
      </div>
      <p class="form-status" role="alert" data-checkout-status hidden></p>
      <button class="btn btn--block btn--whatsapp" type="button" data-checkout${blocked ? " disabled" : ""}><span class="btn__label">Send order request on WhatsApp</span>${icon("message-circle", "btn__icon")}</button>
      <p class="summary__note" data-fallback hidden>If WhatsApp did not open, <a class="link" data-fallback-link target="_blank" rel="noopener noreferrer" href="#">tap here to continue</a>.</p>
      <ol class="checkout-steps">
        <li>Send your request to ${esc(BRAND.name)} on WhatsApp.</li>
        <li>We reply to confirm availability and delivery details.</li>
        <li>Nothing is charged here. An order is only a request until we confirm it.</li>
      </ol>
    </aside>`;
}

function render(focus) {
  const snapshot = cart.detail();
  if (!snapshot.items.length) {
    root.innerHTML = `${emptyHTML()}${savedHTML()}`;
    refreshIcons();
    return;
  }
  root.innerHTML = `
    <header class="cart-head">
      <nav aria-label="Breadcrumb"><ol class="breadcrumbs"><li><a href="${ROUTES.home}">Home</a></li><li><span aria-current="page">Bag</span></li></ol></nav>
      <h1 class="t-display">Your bag</h1>
      <p class="t-body">${pluralize(snapshot.count, "item")} ready for your order request.</p>
    </header>
    <div class="cart-layout">
      <div>
        <ul class="cart-list">${snapshot.items.map(itemHTML).join("")}</ul>
        <div class="cart-tools">
          <a class="link" href="${ROUTES.shop}">Continue shopping</a>
          <button class="cart-item__remove" type="button" data-clear>${clearArmed ? "Tap again to clear your bag" : "Clear bag"}</button>
        </div>
      </div>
      ${summaryHTML(snapshot)}
    </div>
    ${savedHTML()}`;
  refreshIcons();

  if (fallbackUrl) {
    const fallback = qs("[data-fallback]", root);
    qs("[data-fallback-link]", root).href = fallbackUrl;
    fallback.hidden = false;
  }

  if (focus) {
    const line = qsa("[data-line]", root).find((node) => node.dataset.line === focus.key);
    const target = line ? qs(focus.selector, line) : null;
    if (target && !target.disabled) target.focus({ preventScroll: true });
  }
}

root.addEventListener("click", (event) => {
  const lineEl = event.target.closest("[data-line]");
  const step = event.target.closest("[data-step]");
  if (step && lineEl) {
    const { product, variant } = lineEl.dataset;
    const current = Number(qs("[data-qty-input]", lineEl).value) || 1;
    const next = current + Number(step.dataset.step);
    cart.setQty(product, variant, next);
    announce("Quantity updated");
    render({ key: lineEl.dataset.line, selector: step.dataset.step === "1" ? '[data-step="1"]' : '[data-step="-1"]' });
    return;
  }

  const remove = event.target.closest("[data-remove]");
  if (remove && lineEl) {
    const { product, variant } = lineEl.dataset;
    const name = qs(".cart-item__name", lineEl).textContent.trim();
    lineEl.classList.add("is-removing");
    window.setTimeout(() => {
      cart.remove(product, variant);
      announce(`${name} removed from your bag`);
      showToast(`${name} removed`);
      render();
    }, 380);
    return;
  }

  if (event.target.closest("[data-clear]")) {
    if (!clearArmed) {
      clearArmed = true;
      render();
      window.clearTimeout(clearTimer);
      clearTimer = window.setTimeout(() => {
        clearArmed = false;
        render();
      }, 3500);
      return;
    }
    clearArmed = false;
    window.clearTimeout(clearTimer);
    cart.clear();
    fallbackUrl = "";
    announce("Your bag has been cleared");
    render();
    return;
  }

  if (event.target.closest("[data-checkout]")) {
    const status = qs("[data-checkout-status]", root);
    const result = buildOrder(note);
    if (!result.ok) {
      status.hidden = false;
      status.dataset.state = "error";
      status.textContent = result.message;
      return;
    }
    status.hidden = true;
    fallbackUrl = result.url;
    const opened = window.open(result.url, "_blank", "noopener");
    const fallback = qs("[data-fallback]", root);
    qs("[data-fallback-link]", root).href = result.url;
    fallback.hidden = false;
    if (!opened) showToast("Please allow pop-ups, or use the link below the button.", { type: "error" });
  }
});

root.addEventListener("change", (event) => {
  const input = event.target.closest("[data-qty-input]");
  if (!input) return;
  const lineEl = input.closest("[data-line]");
  const value = Math.floor(Number(input.value));
  const { product, variant } = lineEl.dataset;
  if (!Number.isFinite(value) || value < CART_LIMITS.minQty) {
    cart.setQty(product, variant, CART_LIMITS.minQty);
  } else {
    cart.setQty(product, variant, Math.min(value, CART_LIMITS.maxQty));
  }
  announce("Quantity updated");
  render({ key: lineEl.dataset.line, selector: "[data-qty-input]" });
});

root.addEventListener("input", (event) => {
  if (event.target.matches("[data-note]")) note = event.target.value.slice(0, 300);
});

cart.subscribe(() => {
  if (document.activeElement && document.activeElement.matches("[data-qty-input], [data-note]")) return;
  render();
});

wishlist.subscribe(() => {
  const saved = qs("#saved", root);
  if (!saved) return;
  const holder = document.createElement("div");
  holder.innerHTML = savedHTML();
  saved.replaceWith(holder.firstElementChild);
  refreshIcons();
});

render();

if (window.location.hash === "#saved") {
  const target = qs("#saved");
  if (target) window.setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 400);
}
