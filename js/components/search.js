import { ROUTES } from "../core/config.js";
import { debounce, esc, formatMoney, icon, lockScroll, qs, refreshIcons, trapFocus, unlockScroll } from "../core/utils.js";
import { categoryName, hasPriceRange, minPrice, productImages, searchProducts } from "../services/catalog.js";
import { mediaHTML } from "./media.js";

const SUGGESTIONS = ["Shampoo", "Hair oil", "Wig", "Bonnet", "Brush"];

export function createSearch() {
  const root = document.createElement("div");
  root.className = "search";
  root.id = "search";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Search AURELLE");
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `
    <div class="search__inner">
      <div class="search__top">
        <span class="wordmark" aria-hidden="true">AURELLE</span>
        <button class="icon-btn" type="button" data-search-close aria-label="Close search">${icon("x")}</button>
      </div>
      <form class="search__field" role="search" action="${ROUTES.shop}" method="get">
        ${icon("search")}
        <label class="visually-hidden" for="search-input">Search products</label>
        <input class="search__input" id="search-input" name="q" type="search" placeholder="Search the collection" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search">
        <button class="icon-btn search__clear" type="button" data-search-clear aria-label="Clear search" hidden>${icon("x")}</button>
      </form>
      <div class="search__hint" data-search-hint>
        ${SUGGESTIONS.map((term) => `<button class="chip" type="button" data-suggest="${esc(term)}">${esc(term)}</button>`).join("")}
      </div>
      <div class="search__results" data-search-results aria-live="polite"></div>
    </div>`;
  document.body.appendChild(root);
  refreshIcons();

  const input = qs("#search-input", root);
  const results = qs("[data-search-results]", root);
  const clearButton = qs("[data-search-clear]", root);
  const hint = qs("[data-search-hint]", root);
  let release = null;
  let opener = null;
  let isOpen = false;

  const render = () => {
    const query = input.value.trim();
    clearButton.hidden = !query;
    hint.hidden = Boolean(query);
    if (!query) {
      results.innerHTML = "";
      return;
    }
    const found = searchProducts(query, 6);
    if (!found.length) {
      results.innerHTML = `<p class="t-body">Nothing matched “${esc(query)}”. Try a different word, or browse the <a class="link" href="${ROUTES.shop}">full collection</a>.</p>`;
      return;
    }
    const rows = found
      .map((product) => {
        const price = `${hasPriceRange(product) ? "From " : ""}${formatMoney(minPrice(product))}`;
        return `<a class="search-result" href="${ROUTES.product(product.slug)}">
          <span class="search-result__img">${mediaHTML(productImages(product)[0], { sizes: "6rem", width: 480, height: 600 })}</span>
          <span><span class="search-result__name">${esc(product.name.replace("AURELLE ", ""))}</span><span class="t-caption" style="display:block">${esc(categoryName(product.category))}</span></span>
          <span class="t-price">${esc(price)}</span>
        </a>`;
      })
      .join("");
    results.innerHTML = `${rows}<a class="link" style="margin-top:1rem;justify-self:start" href="${ROUTES.shop}?q=${encodeURIComponent(query)}">View all results</a>`;
  };

  const onInput = debounce(render, 90);

  const open = (trigger) => {
    if (isOpen) return;
    isOpen = true;
    opener = trigger || document.activeElement;
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    lockScroll();
    release = trapFocus(root);
    window.setTimeout(() => input.focus(), 350);
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    unlockScroll();
    if (release) release();
    if (opener && opener.focus) opener.focus();
  };

  input.addEventListener("input", onInput);
  clearButton.addEventListener("click", () => {
    input.value = "";
    render();
    input.focus();
  });
  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-search-close]")) close();
    const suggestion = event.target.closest("[data-suggest]");
    if (suggestion) {
      input.value = suggestion.dataset.suggest;
      render();
      input.focus();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) close();
  });
  root.querySelector("form").addEventListener("submit", (event) => {
    if (!input.value.trim()) event.preventDefault();
  });

  return { open, close, isOpen: () => isOpen };
}
