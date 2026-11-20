import { boot } from "../core/app.js";
import { ROUTES } from "../core/config.js";
import { applySEO, injectJSONLD, organizationLD, websiteLD } from "../core/seo.js";
import { esc, formatDate, formatMoney, icon, qs, qsa, refreshIcons } from "../core/utils.js";
import { IMG } from "../data/images.js";
import { mediaHTML } from "../components/media.js";
import { initCampaign, initParallax, initRails, initReveals, initRitual, initWordReveal } from "../components/motion.js";
import { initNewsletter, newsletterHTML } from "../components/newsletter.js";
import { productCardHTML } from "../components/product-card.js";
import { bestsellers, getAllArticles, getProduct, minPrice, productImages } from "../services/catalog.js";

boot({ hideFooterNewsletter: true });

applySEO({
  title: "AURELLE | Luxury Haircare & Beauty Essentials",
  description: "Discover AURELLE's curated collection of haircare essentials, treatments, styling products, wigs and accessories.",
  path: ROUTES.home
});
injectJSONLD("ld-organization", organizationLD());
injectJSONLD("ld-website", websiteLD());

const slot = (name) => qs(`[data-slot="${name}"]`);

const heroSlot = slot("hero");
if (heroSlot) heroSlot.innerHTML = mediaHTML(IMG.hero, { sizes: "(min-width: 1024px) 34rem, 90vw", eager: true, priority: true, width: 1000, height: 1300 });

const ovalSlot = slot("hero-oval");
if (ovalSlot) ovalSlot.innerHTML = mediaHTML(IMG.heroOval, { sizes: "12rem", eager: true, width: 480, height: 640 });

const chip = slot("hero-chip");
if (chip) {
  const product = getProduct("nourishing-hair-oil");
  if (product) {
    chip.setAttribute("href", ROUTES.product(product.slug));
    chip.innerHTML = `
      <span class="hero__chip-img fill">${mediaHTML(productImages(product)[0], { sizes: "3rem", eager: true, width: 480, height: 600 })}</span>
      <span>
        <span class="hero__chip-name">${esc(product.name.replace("AURELLE ", ""))}</span>
        <span class="hero__chip-price">${esc(formatMoney(minPrice(product)))}</span>
      </span>`;
  }
}

const CATEGORY_CARDS = [
  { shape: "arch", title: "Haircare", text: "Cleanse and condition, gently.", href: ROUTES.collection("haircare"), image: IMG.categories.haircare },
  { shape: "pill", title: "Treatments", text: "Masks and oils for slower moments.", href: `${ROUTES.collection("haircare")}?category=treatments`, image: IMG.categories.treatments },
  { shape: "oval", title: "Styling", text: "Prepare, protect and polish.", href: ROUTES.collection("styling"), image: IMG.categories.styling },
  { shape: "leaf", title: "Wigs & Extensions", text: "Length, volume and choice.", href: ROUTES.collection("wigs-extensions"), image: IMG.categories.wigs },
  { shape: "round", title: "Accessories", text: "The quiet essentials.", href: ROUTES.collection("accessories"), image: IMG.categories.accessories }
];

const categories = slot("categories");
if (categories) {
  categories.innerHTML = CATEGORY_CARDS.map(
    (card, index) => `
      <div class="rail__item">
        <article class="cat-card cat-card--${card.shape}" data-reveal="up" style="--i:${index}">
          <div class="cat-card__media">${mediaHTML(card.image, { sizes: "(min-width: 1024px) 18vw, 70vw", width: 800, height: 1100 })}</div>
          <div class="cat-card__body">
            <h3 class="cat-card__title"><a class="cat-card__link" href="${card.href}">${esc(card.title)}</a><span class="cat-card__arrow">${icon("arrow-right")}</span></h3>
            <p class="t-small">${esc(card.text)}</p>
          </div>
        </article>
      </div>`
  ).join("");
}

const favourites = slot("bestsellers");
if (favourites) {
  favourites.innerHTML = bestsellers(6)
    .map((product, index) => `<div class="rail__item">${productCardHTML(product, { index, sizes: "(min-width: 1024px) 22vw, 60vw" })}</div>`)
    .join("");
}

const philosophyMain = slot("philosophy-main");
if (philosophyMain) philosophyMain.innerHTML = mediaHTML(IMG.philosophy.main, { sizes: "(min-width: 1024px) 32rem, 90vw", width: 1000, height: 1300 });
const philosophySmall = slot("philosophy-small");
if (philosophySmall) philosophySmall.innerHTML = mediaHTML(IMG.philosophy.small, { sizes: "14rem", width: 600, height: 600 });

const ritualVisual = slot("ritual-visual");
if (ritualVisual) {
  const order = ["cleanse", "condition", "treat", "style", "finish"];
  ritualVisual.innerHTML = order
    .map((name, index) => `<div class="ritual__img${index === 0 ? " is-active" : ""}">${mediaHTML(IMG.ritual[name], { sizes: "(min-width: 900px) 28rem, 18rem", width: 900, height: 1200, eager: index === 0 })}</div>`)
    .join("");
}

const campaign = slot("campaign");
if (campaign) campaign.innerHTML = mediaHTML(IMG.campaign, { sizes: "100vw", width: 1600, height: 1000 });

const journal = slot("journal");
if (journal) {
  journal.innerHTML = getAllArticles()
    .slice(0, 3)
    .map(
      (article, index) => `
      <article class="article-card" data-reveal="up" style="--i:${index}">
        <div class="article-card__media">${mediaHTML(IMG.journal[article.image], { sizes: "(min-width: 1024px) 30vw, 90vw", width: 800, height: 1000 })}</div>
        <div class="article-card__meta"><span class="badge badge--blush">${esc(article.category)}</span><span>${esc(formatDate(article.date))}</span></div>
        <h3 class="article-card__title"><a href="${ROUTES.article(article.slug)}">${esc(article.title)}</a></h3>
        <p class="t-small">${esc(article.excerpt)}</p>
      </article>`
    )
    .join("");
}

const newsletter = slot("newsletter");
if (newsletter) {
  newsletter.innerHTML = newsletterHTML("home");
  initNewsletter(newsletter);
}

refreshIcons();
initReveals();
initRails();
initWordReveal();
initParallax();
initRitual(qs("[data-ritual]"));
initCampaign(qs("[data-campaign]"));

qsa("[data-ritual-skip]").forEach((link) => link.addEventListener("click", () => {
  const next = qs("[data-campaign]");
  if (next) next.scrollIntoView({ behavior: "smooth" });
}));
