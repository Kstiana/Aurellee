import { CART_LIMITS, ROUTES } from "../core/config.js";
import { clamp, esc, formatMoney, icon, qs, qsa, refreshIcons } from "../core/utils.js";
import { defaultVariant, getVariant, isPurchasable } from "../services/catalog.js";
import * as cart from "../services/cart.js";
import * as wishlist from "../services/wishlist.js";
import { buildEnquiry } from "../services/whatsapp.js";
import { showToast } from "./toast.js";

export function buyBoxHTML(product, prefix = "buy") {
  const selected = defaultVariant(product);
  const purchasable = isPurchasable(product);
  const multiple = product.variants.length > 1;
  const saved = wishlist.has(product.id);

  const options = multiple
    ? `<fieldset class="buy__group">
        <legend class="buy__label">${esc(product.optionName)} <span data-selected-label>${esc(selected.label)}</span></legend>
        <div class="options" role="radiogroup">
          ${product.variants
            .map(
              (variant) => `<label class="option">
                <input type="radio" name="${esc(prefix)}-option" value="${esc(variant.id)}"${variant.id === selected.id ? " checked" : ""}${variant.available ? "" : " disabled"} data-variant>
                <span>${esc(variant.label)}${variant.available ? "" : " (unavailable)"}</span>
              </label>`
            )
            .join("")}
        </div>
      </fieldset>`
    : `<div class="buy__group"><p class="buy__label">${esc(product.optionName)} <span>${esc(selected.label)}</span></p><input type="hidden" value="${esc(selected.id)}" data-variant-single></div>`;

  return `
    <div class="buy" data-buy data-product="${esc(product.slug)}">
      ${options}
      <div class="buy__group">
        <label class="buy__label" for="${esc(prefix)}-qty">Quantity</label>
        <div class="buy__row">
          <div class="qty">
            <button class="qty__btn" type="button" data-qty-step="-1" aria-label="Decrease quantity">${icon("minus")}</button>
            <input class="qty__value" id="${esc(prefix)}-qty" type="number" inputmode="numeric" min="${CART_LIMITS.minQty}" max="${CART_LIMITS.maxQty}" step="1" value="1" data-qty>
            <button class="qty__btn" type="button" data-qty-step="1" aria-label="Increase quantity">${icon("plus")}</button>
          </div>
          <button class="btn btn--block" type="button" data-add-to-bag${purchasable ? "" : " disabled"}><span class="btn__label">${purchasable ? "Add to bag" : "Unavailable"}</span>${icon("shopping-bag", "btn__icon")}</button>
        </div>
      </div>
      <p class="buy__error" role="alert" data-buy-error></p>
      <div class="buy__secondary">
        <a class="btn btn--ghost btn--block" href="#" target="_blank" rel="noopener noreferrer" data-enquiry><span class="btn__label">Ask about this on WhatsApp</span>${icon("message-circle", "btn__icon")}</a>
        <button class="wish-btn" type="button" aria-pressed="${saved}" aria-label="${saved ? "Remove from" : "Save to"} saved items" data-wish-btn>${icon("heart")}</button>
      </div>
    </div>`;
}

export function bindBuyBox(root, product, options = {}) {
  const { onVariant = () => {}, onAdded = () => {} } = options;
  const box = qs("[data-buy]", root) || root;
  const qtyInput = qs("[data-qty]", box);
  const addButton = qs("[data-add-to-bag]", box);
  const errorBox = qs("[data-buy-error]", box);
  const enquiry = qs("[data-enquiry]", box);
  const wishButton = qs("[data-wish-btn]", box);
  const selectedLabel = qs("[data-selected-label]", box);

  const currentVariant = () => {
    const checked = qs("[data-variant]:checked", box);
    const single = qs("[data-variant-single]", box);
    return getVariant(product, checked ? checked.value : single ? single.value : "");
  };

  const currentQty = () => clamp(Math.floor(Number(qtyInput.value)) || CART_LIMITS.minQty, CART_LIMITS.minQty, CART_LIMITS.maxQty);

  const setError = (message) => {
    errorBox.textContent = message || "";
  };

  const syncQtyButtons = () => {
    const value = currentQty();
    qsa("[data-qty-step]", box).forEach((button) => {
      const step = Number(button.dataset.qtyStep);
      button.disabled = (step < 0 && value <= CART_LIMITS.minQty) || (step > 0 && value >= CART_LIMITS.maxQty);
    });
  };

  const syncEnquiry = () => {
    const variant = currentVariant();
    enquiry.href = buildEnquiry(product, variant, currentQty()).url;
  };

  const refresh = () => {
    const variant = currentVariant();
    if (selectedLabel && variant) selectedLabel.textContent = variant.label;
    syncQtyButtons();
    syncEnquiry();
    if (variant) onVariant(variant);
  };

  qsa("[data-qty-step]", box).forEach((button) => {
    button.addEventListener("click", () => {
      qtyInput.value = String(clamp(currentQty() + Number(button.dataset.qtyStep), CART_LIMITS.minQty, CART_LIMITS.maxQty));
      setError("");
      refresh();
    });
  });

  qtyInput.addEventListener("input", () => {
    setError("");
    syncEnquiry();
  });

  qtyInput.addEventListener("change", () => {
    qtyInput.value = String(currentQty());
    refresh();
  });

  qsa("[data-variant]", box).forEach((input) => {
    input.addEventListener("change", () => {
      setError("");
      refresh();
    });
  });

  addButton.addEventListener("click", () => {
    const variant = currentVariant();
    if (!variant) {
      setError(`Please choose a ${product.optionName.toLowerCase()}.`);
      return;
    }
    const raw = Number(qtyInput.value);
    if (!Number.isInteger(raw) || raw < CART_LIMITS.minQty || raw > CART_LIMITS.maxQty) {
      setError(`Please enter a quantity between ${CART_LIMITS.minQty} and ${CART_LIMITS.maxQty}.`);
      qtyInput.focus();
      return;
    }
    const result = cart.add(product.id, variant.id, raw);
    if (!result.ok) {
      setError(result.message);
      showToast(result.message, { type: "error" });
      return;
    }
    setError("");
    showToast(`${product.name.replace("AURELLE ", "")} added to your bag`, { action: { label: "View bag", href: ROUTES.cart } });
    const label = qs(".btn__label", addButton);
    label.textContent = "Added";
    addButton.disabled = true;
    window.setTimeout(() => {
      label.textContent = "Add to bag";
      addButton.disabled = false;
    }, 1400);
    onAdded(result);
  });

  wishButton.addEventListener("click", () => {
    const result = wishlist.toggle(product.id);
    if (!result.ok) return;
    wishButton.setAttribute("aria-pressed", String(result.saved));
    wishButton.setAttribute("aria-label", `${result.saved ? "Remove from" : "Save to"} saved items`);
    showToast(result.saved ? "Saved for later" : "Removed from saved items", result.saved ? { action: { label: "View saved", href: `${ROUTES.cart}#saved` } } : {});
  });

  wishlist.subscribe(() => {
    const saved = wishlist.has(product.id);
    wishButton.setAttribute("aria-pressed", String(saved));
  });

  refreshIcons();
  refresh();
  return { currentVariant, currentQty };
}

export const priceLabel = (variant) => formatMoney(variant.price);
