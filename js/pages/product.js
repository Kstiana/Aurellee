import { boot } from "../core/app.js";
import { ROUTES } from "../core/config.js";
import { getSlug } from "../core/router.js";
import { applySEO, breadcrumbLD, injectJSONLD, productLD } from "../core/seo.js";
import { esc, formatMoney, icon, qs, qsa, refreshIcons } from "../core/utils.js";
import { pexelsUrl } from "../data/images.js";
import { buyBoxHTML, bindBuyBox } from "../components/buy-box.js";
import { mediaHTML } from "../components/media.js";
import { initReveals, initRails } from "../components/motion.js";
import { productCardHTML } from "../components/product-card.js";
import { availabilityInfo, categoryName, collectionForCategory, defaultVariant, getProduct, hasPriceRange, minPrice, productImages, relatedProducts } from "../services/catalog.js";
import { record, recentProducts } from "../services/recent.js";

boot();

const root = qs("#product-root");
const slug = getSlug("product");
const product = slug ? getProduct(slug) : null;

function renderMissing() {
  applySEO({ title: "Product not found | AURELLE", description: "This product could not be found. Browse the AURELLE collection instead.", path: window.location.pathname, noindex: true });
  root.innerHTML = `
    <div class="not-found">
      <div class="empty-state__mark">${icon("search-x")}</div>
      <h1 class="t-title">We could not find that piece</h1>
      <p class="t-body">The link may be out of date, or the product may no longer be part of the collection.</p>
      <a class="btn" href="${ROUTES.shop}"><span class="btn__label">Browse the collection</span>${icon("arrow-right", "btn__icon")}</a>
    </div>`;
  refreshIcons();
}

function list(items) {
  return `<ul class="benefit-list">${items.map((item) => `<li><span>${esc(item)}</span></li>`).join("")}</ul>`;
}

function accordionItem(title, body, open = false) {
  return `
    <details class="accordion__item"${open ? " open" : ""}>
      <summary class="accordion__summary"><span>${esc(title)}</span><span class="accordion__icon" aria-hidden="true"></span></summary>
      <div class="accordion__body">${body}</div>
    </details>`;
}

function render(item) {
  const images = productImages(item);
  const collection = collectionForCategory(item.category);
  const selected = defaultVariant(item);
  const info = availabilityInfo(item);
  const short = item.name.replace("AURELLE ", "");

  const trail = [
    { label: "Home", href: ROUTES.home },
    { label: "Shop", href: ROUTES.shop },
    ...(collection ? [{ label: collection.title, href: ROUTES.collection(collection.slug) }] : []),
    { label: short, href: ROUTES.product(item.slug) }
  ];

  const specs = Object.entries(item.specifications)
    .map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`)
    .join("");

  const ingredientsBody = item.ingredients && item.ingredients.length
    ? list(item.ingredients)
    : item.materials && item.materials.length
      ? list(item.materials)
      : `<p>This is a sample product. A full ingredient list would appear here and would be confirmed against the product label before sale.</p>`;
  const ingredientsTitle = item.materials && item.materials.length && !(item.ingredients && item.ingredients.length) ? "Materials" : "Ingredients";

  root.innerHTML = `
    <nav aria-label="Breadcrumb"><ol class="breadcrumbs">
      ${trail.map((step, index) => (index === trail.length - 1 ? `<li><span aria-current="page">${esc(step.label)}</span></li>` : `<li><a href="${step.href}">${esc(step.label)}</a></li>`)).join("")}
    </ol></nav>
    <div class="product-layout">
      <div class="gallery" data-gallery>
        <div class="gallery__stage" aria-roledescription="carousel" aria-label="${esc(item.name)} images">
          <div class="gallery__count"><span class="badge" data-gallery-count>1 / ${images.length}</span></div>
          ${images
            .map(
              (image, index) => `<div class="gallery__slide gallery__zoom${index === 0 ? " is-active" : ""}" data-slide aria-hidden="${index === 0 ? "false" : "true"}" role="group" aria-label="Image ${index + 1} of ${images.length}">${mediaHTML(image, { sizes: "(min-width: 960px) 40vw, 92vw", eager: index === 0, priority: index === 0, width: 1000, height: 1250 })}</div>`
            )
            .join("")}
          <div class="gallery__nav">
            <button class="icon-btn" type="button" data-gallery-prev aria-label="Previous image">${icon("arrow-left")}</button>
            <button class="icon-btn" type="button" data-gallery-next aria-label="Next image">${icon("arrow-right")}</button>
          </div>
        </div>
        <div class="gallery__thumbs" role="group" aria-label="Choose image">
          ${images
            .map(
              (image, index) => `<button class="gallery__thumb" type="button" data-thumb="${index}" aria-label="Show image ${index + 1}" aria-current="${index === 0}">${mediaHTML(image, { sizes: "5rem", width: 320, height: 400 })}</button>`
            )
            .join("")}
        </div>
      </div>
      <div class="product-info">
        <div class="product-info__head">
          <p class="product-info__cat">${esc(categoryName(item.category))}</p>
          <h1 class="product-info__name">${esc(short)}</h1>
          <p class="product-info__price">${hasPriceRange(item) ? '<span class="t-caption" style="font-size:var(--step--1)">From</span>' : ""}<span data-price>${esc(formatMoney(selected.price))}</span></p>
          <p class="product-info__lede">${esc(item.shortDescription)}</p>
          <p class="status" data-state="${esc(info.state)}">${esc(info.label)}</p>
          <p class="t-small">${esc(info.note)}</p>
        </div>
        ${buyBoxHTML(item, "pdp")}
        <div class="assurances">
          <div class="assurance"><span class="assurance__icon">${icon("message-circle")}</span><span>Order requests are sent by WhatsApp and confirmed with you.</span></div>
          <div class="assurance"><span class="assurance__icon">${icon("package-check")}</span><span>Availability and delivery are confirmed before anything is arranged.</span></div>
          <div class="assurance"><span class="assurance__icon">${icon("globe")}</span><span>Enquiries from anywhere in the world are welcome.</span></div>
        </div>
        <div class="accordion">
          ${accordionItem("Description", `<p>${esc(item.description)}</p>`, true)}
          ${accordionItem("Benefits", list(item.benefits))}
          ${accordionItem(ingredientsTitle, ingredientsBody)}
          ${accordionItem("How to use", `<p>${esc(item.howToUse)}</p>`)}
          ${accordionItem("Specifications", `<dl class="spec-list">${specs}</dl>`)}
          ${accordionItem("Shipping", `<p>Delivery options and timing are confirmed with you on WhatsApp when you send your order request. This is a demonstration store, so no delivery commitment is shown here.</p><p style="margin-top:.75rem"><a class="link" href="${ROUTES.shipping}">Read shipping &amp; returns</a></p>`)}
        </div>
      </div>
    </div>
    <section class="related" aria-labelledby="related-title" data-related>
      <div class="section-head section-head--split">
        <h2 class="t-title" id="related-title">You may also like</h2>
        <div class="section-head__aside"><div class="rail-controls"><button class="icon-btn" type="button" data-rail-for="related-rail" data-rail-prev aria-label="Previous products">${icon("arrow-left")}</button><button class="icon-btn" type="button" data-rail-for="related-rail" data-rail-next aria-label="Next products">${icon("arrow-right")}</button></div></div>
      </div>
      <div class="rail" id="related-rail">${relatedProducts(item, 4).map((related, index) => `<div class="rail__item">${productCardHTML(related, { index, sizes: "(min-width: 1024px) 22vw, 60vw" })}</div>`).join("")}</div>
    </section>
    <section class="recent" aria-labelledby="recent-title" data-recent hidden>
      <div class="section-head"><h2 class="t-title" id="recent-title">Recently viewed</h2></div>
      <div class="rail" id="recent-rail"></div>
    </section>
    <div class="sticky-buy" data-sticky>
      <div><span class="sticky-buy__name">${esc(short)}</span><span class="t-price" data-sticky-price>${esc(formatMoney(selected.price))}</span></div>
      <button class="btn btn--small" type="button" data-sticky-add><span class="btn__label">Add to bag</span></button>
    </div>`;
  refreshIcons();

  const priceEls = qsa("[data-price], [data-sticky-price]", root);
  const box = qs("[data-buy]", root);
  bindBuyBox(root, item, {
    onVariant: (variant) => priceEls.forEach((node) => (node.textContent = formatMoney(variant.price)))
  });

  const stickyAdd = qs("[data-sticky-add]", root);
  const addButton = qs("[data-add-to-bag]", root);
  if (stickyAdd && addButton) {
    stickyAdd.addEventListener("click", () => addButton.click());
    if (addButton.disabled && addButton.textContent.includes("Unavailable")) stickyAdd.disabled = true;
  }

  initGallery(root, images.length);
  initSticky(box, qs("[data-sticky]", root));

  const recents = recentProducts(item.id, 4);
  if (recents.length) {
    const section = qs("[data-recent]", root);
    qs("#recent-rail", root).innerHTML = recents.map((recent, index) => `<div class="rail__item">${productCardHTML(recent, { index, sizes: "(min-width: 1024px) 22vw, 60vw" })}</div>`).join("");
    section.hidden = false;
  }

  initRails(root);
  initReveals(root);

  applySEO({
    title: `${short} | AURELLE`,
    description: `${item.shortDescription} ${hasPriceRange(item) ? "From" : ""} ${formatMoney(minPrice(item))}. Order by WhatsApp from AURELLE.`.replace(/\s+/g, " ").trim(),
    path: ROUTES.product(item.slug),
    image: pexelsUrl(images[0].id, 1200),
    type: "product"
  });
  injectJSONLD("ld-product", productLD(item));
  injectJSONLD("ld-breadcrumb", breadcrumbLD(trail));
  record(item.id);
}

function initGallery(scope, total) {
  const slides = qsa("[data-slide]", scope);
  const thumbs = qsa("[data-thumb]", scope);
  const counter = qs("[data-gallery-count]", scope);
  const stage = qs(".gallery__stage", scope);
  let index = 0;

  const show = (next) => {
    index = (next + total) % total;
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
      slide.classList.remove("is-zoomed");
      slide.setAttribute("aria-hidden", String(i !== index));
    });
    thumbs.forEach((thumb, i) => thumb.setAttribute("aria-current", String(i === index)));
    if (counter) counter.textContent = `${index + 1} / ${total}`;
  };

  thumbs.forEach((thumb, i) => thumb.addEventListener("click", () => show(i)));
  const prev = qs("[data-gallery-prev]", scope);
  const next = qs("[data-gallery-next]", scope);
  if (prev) prev.addEventListener("click", () => show(index - 1));
  if (next) next.addEventListener("click", () => show(index + 1));

  stage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
  });

  let startX = 0;
  let swiping = false;
  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;
    swiping = true;
    startX = event.clientX;
  });
  stage.addEventListener("pointerup", (event) => {
    if (!swiping) return;
    swiping = false;
    const delta = event.clientX - startX;
    if (Math.abs(delta) > 48) show(delta < 0 ? index + 1 : index - 1);
  });
  stage.addEventListener("pointercancel", () => {
    swiping = false;
  });

  slides.forEach((slide) => {
    slide.addEventListener("click", (event) => {
      if (event.pointerType === "touch" || !window.matchMedia("(hover: hover)").matches) return;
      slide.classList.toggle("is-zoomed");
    });
    slide.addEventListener("pointermove", (event) => {
      if (!slide.classList.contains("is-zoomed")) return;
      const rect = slide.getBoundingClientRect();
      slide.style.setProperty("--zx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      slide.style.setProperty("--zy", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });
    slide.addEventListener("pointerleave", () => slide.classList.remove("is-zoomed"));
  });
}

function initSticky(box, bar) {
  if (!box || !bar || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    ([entry]) => {
      const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle("is-visible", past);
    },
    { threshold: 0 }
  );
  observer.observe(box);
}

if (product) render(product);
else renderMissing();
