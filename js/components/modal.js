import { ROUTES } from "../core/config.js";
import { esc, formatMoney, icon, lockScroll, qs, refreshIcons, trapFocus, unlockScroll } from "../core/utils.js";
import { availabilityInfo, categoryName, defaultVariant, productImages } from "../services/catalog.js";
import { bindBuyBox, buyBoxHTML } from "./buy-box.js";
import { mediaHTML } from "./media.js";
import { setQuickViewHandler } from "./product-card.js";

let modal = null;
let release = null;
let opener = null;

function ensureModal() {
  if (modal) return modal;
  modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Quick view");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="modal__scrim" data-modal-close></div>
    <div class="modal__dialog">
      <button class="icon-btn modal__close" type="button" data-modal-close aria-label="Close quick view">${icon("x")}</button>
      <div data-modal-body></div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-modal-close]")) closeQuickView();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) closeQuickView();
  });
  return modal;
}

export function openQuickView(product, trigger) {
  const root = ensureModal();
  const body = qs("[data-modal-body]", root);
  const images = productImages(product);
  const info = availabilityInfo(product);
  const selected = defaultVariant(product);

  body.innerHTML = `
    <div class="quick-view">
      <div class="quick-view__media fill shape-arch-tall" style="border-radius:0">${mediaHTML(images[0], { sizes: "(min-width: 768px) 30rem, 100vw", eager: true, width: 800, height: 1000 })}</div>
      <div class="quick-view__info">
        <p class="product-info__cat">${esc(categoryName(product.category))}</p>
        <h2 class="t-heading">${esc(product.name.replace("AURELLE ", ""))}</h2>
        <p class="product-info__price"><span data-price>${esc(formatMoney(selected.price))}</span></p>
        <p class="t-body">${esc(product.shortDescription)}</p>
        <p class="status" data-state="${esc(info.state)}">${esc(info.label)}</p>
        ${buyBoxHTML(product, "quick")}
        <a class="link" href="${ROUTES.product(product.slug)}">View full details</a>
      </div>
    </div>`;
  refreshIcons();

  const price = qs("[data-price]", body);
  bindBuyBox(body, product, {
    onVariant: (variant) => {
      price.textContent = formatMoney(variant.price);
    }
  });

  opener = trigger || document.activeElement;
  root.classList.add("is-open");
  root.setAttribute("aria-hidden", "false");
  lockScroll();
  release = trapFocus(root);
  window.setTimeout(() => {
    const first = qs("input:checked, [data-add-to-bag]", body);
    if (first) first.focus({ preventScroll: true });
  }, 450);
}

export function closeQuickView() {
  if (!modal || !modal.classList.contains("is-open")) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  unlockScroll();
  if (release) release();
  if (opener && opener.focus) opener.focus({ preventScroll: true });
}

export function initQuickView() {
  setQuickViewHandler(openQuickView);
}
