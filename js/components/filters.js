import { getParams, setParams } from "../core/router.js";
import { clamp, debounce, esc, formatMoney, icon, pluralize, qs, qsa, refreshIcons } from "../core/utils.js";
import { CATEGORIES } from "../data/categories.js";
import { COLLECTION_TYPE_LABELS, SORT_OPTIONS, applyFilters, availabilityGroup, priceBounds, sortProducts, typeLabel } from "../services/catalog.js";

const GROUPS = [
  { key: "categories", param: "category", title: "Category" },
  { key: "types", param: "type", title: "Product type" },
  { key: "collectionTypes", param: "collectionType", title: "Hair collection" },
  { key: "availability", param: "availability", title: "Availability" }
];

const AVAILABILITY_LABELS = { "in-stock": "In stock", "made-to-order": "Made to order" };

function optionSets(base) {
  const present = (selector) => Array.from(new Set(base.map(selector).filter(Boolean)));
  const categoryIds = present((product) => product.category);
  return {
    categories: CATEGORIES.filter((category) => categoryIds.includes(category.id)).map((category) => ({ value: category.id, label: category.name })),
    types: present((product) => product.type).map((value) => ({ value, label: typeLabel(value) })),
    collectionTypes: present((product) => product.collectionType).map((value) => ({ value, label: COLLECTION_TYPE_LABELS[value] || value })),
    availability: present(availabilityGroup).map((value) => ({ value, label: AVAILABILITY_LABELS[value] || value }))
  };
}

function readState(sets, bounds) {
  const params = getParams();
  const state = { categories: [], types: [], collectionTypes: [], availability: [], min: null, max: null, sort: "featured", q: "" };
  GROUPS.forEach(({ key, param }) => {
    const allowed = sets[key].map((option) => option.value);
    state[key] = (params.get(param) || "")
      .split(",")
      .map((value) => value.trim())
      .filter((value) => allowed.includes(value));
  });
  const sort = params.get("sort");
  if (SORT_OPTIONS.some((option) => option.value === sort)) state.sort = sort;
  state.q = (params.get("q") || "").slice(0, 80);
  const min = Number(params.get("min"));
  const max = Number(params.get("max"));
  if (params.get("min") !== null && Number.isFinite(min) && min > bounds.min) state.min = clamp(min, bounds.min, bounds.max);
  if (params.get("max") !== null && Number.isFinite(max) && max < bounds.max) state.max = clamp(max, bounds.min, bounds.max);
  if (state.min !== null && state.max !== null && state.min > state.max) state.min = state.max;
  return state;
}

function writeState(state) {
  setParams({
    category: state.categories,
    type: state.types,
    collectionType: state.collectionTypes,
    availability: state.availability,
    min: state.min,
    max: state.max,
    sort: state.sort === "featured" ? null : state.sort,
    q: state.q || null
  });
}

export function mountFilters(root, base, onChange) {
  const sets = optionSets(base);
  const bounds = priceBounds(base);
  const state = readState(sets, bounds);
  const visibleGroups = GROUPS.filter(({ key }) => sets[key].length > 1);

  const groupHTML = visibleGroups
    .map(
      ({ key, title }) => `
      <fieldset class="filter-group">
        <legend class="filter-group__title">${esc(title)}</legend>
        <div class="cluster cluster--s">
          ${sets[key].map((option) => `<button class="chip" type="button" aria-pressed="false" data-group="${key}" data-value="${esc(option.value)}">${esc(option.label)}</button>`).join("")}
        </div>
      </fieldset>`
    )
    .join("");

  const showPrice = bounds.max > bounds.min;
  const priceHTML = showPrice
    ? `<fieldset class="filter-group">
        <legend class="filter-group__title">Price</legend>
        <div class="range">
          <div class="range__row"><span>From <strong data-min-label></strong></span><span>Up to <strong data-max-label></strong></span></div>
          <label class="visually-hidden" for="price-min">Minimum price</label>
          <input id="price-min" type="range" min="${bounds.min}" max="${bounds.max}" step="1" value="${state.min ?? bounds.min}" data-price="min">
          <label class="visually-hidden" for="price-max">Maximum price</label>
          <input id="price-max" type="range" min="${bounds.min}" max="${bounds.max}" step="1" value="${state.max ?? bounds.max}" data-price="max">
        </div>
      </fieldset>`
    : "";

  root.innerHTML = `
    <div class="toolbar">
      <div class="container">
        <div class="toolbar__row">
          <p class="toolbar__count" data-count aria-live="polite"></p>
          <div class="toolbar__tools">
            <div class="search-inline">
              ${icon("search")}
              <label class="visually-hidden" for="shop-search">Search this collection</label>
              <input class="search-inline__input" id="shop-search" type="search" placeholder="Search" autocomplete="off" value="${esc(state.q)}" data-search>
              <button class="search-inline__clear" type="button" aria-label="Clear search" data-search-clear hidden>${icon("x")}</button>
            </div>
            <button class="chip" type="button" aria-expanded="false" aria-controls="filters-panel" data-filter-toggle>${icon("sliders-horizontal")}<span>Filters</span><span data-filter-num></span></button>
            <div class="sort">
              <label class="visually-hidden" for="shop-sort">Sort by</label>
              <select class="sort__select" id="shop-sort" data-sort>
                ${SORT_OPTIONS.map((option) => `<option value="${option.value}">${esc(option.label)}</option>`).join("")}
              </select>
            </div>
          </div>
        </div>
        <div class="active-filters" data-active></div>
      </div>
    </div>
    <div class="container">
      <div class="filter-panel" id="filters-panel" data-panel>
        <div class="filter-panel__inner" inert>
          <div class="filter-panel__grid">${groupHTML}${priceHTML}</div>
          <div class="filters-drawer-actions">
            <button class="btn btn--ghost btn--small" type="button" data-reset><span class="btn__label">Clear all</span></button>
          </div>
        </div>
      </div>
    </div>`;
  refreshIcons();

  const countEl = qs("[data-count]", root);
  const activeEl = qs("[data-active]", root);
  const sortEl = qs("[data-sort]", root);
  const searchEl = qs("[data-search]", root);
  const clearSearch = qs("[data-search-clear]", root);
  const toggle = qs("[data-filter-toggle]", root);
  const panel = qs("[data-panel]", root);
  const inner = qs(".filter-panel__inner", root);
  const filterNum = qs("[data-filter-num]", root);
  const minInput = qs('[data-price="min"]', root);
  const maxInput = qs('[data-price="max"]', root);
  const minLabel = qs("[data-min-label]", root);
  const maxLabel = qs("[data-max-label]", root);

  sortEl.value = state.sort;

  const results = () => sortProducts(applyFilters(base, { ...state, query: state.q }), state.sort);

  const activeEntries = () => {
    const entries = [];
    GROUPS.forEach(({ key }) => {
      state[key].forEach((value) => {
        const option = sets[key].find((item) => item.value === value);
        if (option) entries.push({ group: key, value, label: option.label });
      });
    });
    if (state.min !== null || state.max !== null) {
      const low = state.min ?? bounds.min;
      const high = state.max ?? bounds.max;
      entries.push({ group: "price", value: "price", label: `${formatMoney(low)} to ${formatMoney(high)}` });
    }
    if (state.q) entries.push({ group: "q", value: state.q, label: `“${state.q}”` });
    return entries;
  };

  const sync = (shouldWrite = true) => {
    qsa("[data-group]", root).forEach((chip) => {
      chip.setAttribute("aria-pressed", String(state[chip.dataset.group].includes(chip.dataset.value)));
    });
    if (minInput) {
      minInput.value = String(state.min ?? bounds.min);
      maxInput.value = String(state.max ?? bounds.max);
      minLabel.textContent = formatMoney(Number(minInput.value));
      maxLabel.textContent = formatMoney(Number(maxInput.value));
    }
    clearSearch.hidden = !state.q;
    if (searchEl.value !== state.q) searchEl.value = state.q;
    sortEl.value = state.sort;

    const entries = activeEntries();
    const filterCount = entries.filter((entry) => entry.group !== "q").length;
    filterNum.textContent = filterCount ? `(${filterCount})` : "";
    activeEl.innerHTML = entries.length
      ? `${entries.map((entry) => `<button class="chip" type="button" data-remove-group="${esc(entry.group)}" data-remove-value="${esc(entry.value)}" aria-label="Remove filter ${esc(entry.label)}"><span>${esc(entry.label)}</span>${icon("x")}</button>`).join("")}<button class="active-filters__reset" type="button" data-reset>Clear all</button>`
      : "";
    refreshIcons();
    if (shouldWrite) writeState(state);
  };

  const emit = () => {
    const list = results();
    countEl.textContent = list.length === base.length ? pluralize(list.length, "piece") : `${list.length} of ${base.length} pieces`;
    onChange(list, { ...state }, reset);
  };

  const update = (shouldWrite = true) => {
    sync(shouldWrite);
    emit();
  };

  function reset() {
    state.categories = [];
    state.types = [];
    state.collectionTypes = [];
    state.availability = [];
    state.min = null;
    state.max = null;
    state.q = "";
    update();
  }

  root.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-group]");
    if (chip) {
      const list = state[chip.dataset.group];
      const index = list.indexOf(chip.dataset.value);
      if (index >= 0) list.splice(index, 1);
      else list.push(chip.dataset.value);
      update();
      return;
    }
    const removal = event.target.closest("[data-remove-group]");
    if (removal) {
      const group = removal.dataset.removeGroup;
      if (group === "price") {
        state.min = null;
        state.max = null;
      } else if (group === "q") {
        state.q = "";
      } else {
        state[group] = state[group].filter((value) => value !== removal.dataset.removeValue);
      }
      update();
      return;
    }
    if (event.target.closest("[data-reset]")) reset();
  });

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("is-open", open);
    if (open) inner.removeAttribute("inert");
    else inner.setAttribute("inert", "");
  });

  sortEl.addEventListener("change", () => {
    state.sort = sortEl.value;
    update();
  });

  const onSearch = debounce(() => {
    state.q = searchEl.value.trim().slice(0, 80);
    update();
  }, 160);
  searchEl.addEventListener("input", onSearch);
  searchEl.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && searchEl.value) {
      searchEl.value = "";
      state.q = "";
      update();
    }
  });
  clearSearch.addEventListener("click", () => {
    state.q = "";
    update();
    searchEl.focus();
  });

  if (minInput) {
    const onPrice = (changed) => {
      let low = Number(minInput.value);
      let high = Number(maxInput.value);
      if (low > high) {
        if (changed === "min") high = low;
        else low = high;
      }
      state.min = low > bounds.min ? low : null;
      state.max = high < bounds.max ? high : null;
      sync(false);
    };
    const commit = debounce(() => {
      writeState(state);
      emit();
    }, 140);
    minInput.addEventListener("input", () => {
      onPrice("min");
      commit();
    });
    maxInput.addEventListener("input", () => {
      onPrice("max");
      commit();
    });
  }

  if (state.categories.length || state.types.length || state.collectionTypes.length || state.availability.length || state.min !== null || state.max !== null) {
    toggle.setAttribute("aria-expanded", "true");
    panel.classList.add("is-open");
    inner.removeAttribute("inert");
  }

  update(false);

  return { reset, getState: () => ({ ...state }) };
}
