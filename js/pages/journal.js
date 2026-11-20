import { boot } from "../core/app.js";
import { ROUTES } from "../core/config.js";
import { getParams, getSlug, setParams } from "../core/router.js";
import { applySEO, articleLD, breadcrumbLD, injectJSONLD } from "../core/seo.js";
import { debounce, esc, formatDate, formatMoney, icon, qs, qsa, refreshIcons } from "../core/utils.js";
import { ARTICLE_CATEGORIES } from "../data/articles.js";
import { IMG, pexelsUrl } from "../data/images.js";
import { mediaHTML } from "../components/media.js";
import { initReveals } from "../components/motion.js";
import { getAllArticles, getArticle, hasPriceRange, minPrice, productImages, productsForArticle, relatedArticles } from "../services/catalog.js";

boot();

const page = document.body.dataset.page;

function cardHTML(article, index = 0) {
  return `
    <article class="article-card" data-reveal="up" style="--i:${index}">
      <div class="article-card__media">${mediaHTML(IMG.journal[article.image], { sizes: "(min-width: 1024px) 30vw, 90vw", width: 800, height: 1000 })}</div>
      <div class="article-card__meta"><span class="badge badge--blush">${esc(article.category)}</span><span>${esc(formatDate(article.date))}</span></div>
      <h3 class="article-card__title"><a href="${ROUTES.article(article.slug)}">${esc(article.title)}</a></h3>
      <p class="t-small">${esc(article.excerpt)}</p>
    </article>`;
}

function matches(article, query) {
  const text = `${article.title} ${article.category} ${article.excerpt} ${article.intro}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => text.includes(token));
}

function initLanding() {
  applySEO({
    title: "The Hair Journal | AURELLE",
    description: "Calm, useful reading on haircare rituals, treatments, styling, wig care and beauty, from the AURELLE Hair Journal.",
    path: ROUTES.journal
  });
  injectJSONLD("ld-breadcrumb", breadcrumbLD([{ label: "Home", href: ROUTES.home }, { label: "Journal", href: ROUTES.journal }]));

  const nav = qs("[data-category-nav]");
  const search = qs("[data-journal-search]");
  const clear = qs("[data-journal-clear]");
  const featuredRoot = qs("[data-featured]");
  const list = qs("[data-journal-list]");
  const all = getAllArticles();
  const params = getParams();
  const state = { category: ARTICLE_CATEGORIES.includes(params.get("category")) ? params.get("category") : "", q: (params.get("q") || "").slice(0, 80) };
  search.value = state.q;

  const paint = () => {
    clear.hidden = !state.q;
    nav.innerHTML = ["All", ...ARTICLE_CATEGORIES]
      .map((label) => {
        const active = label === "All" ? !state.category : state.category === label;
        return `<button class="chip" type="button" aria-pressed="${active}" data-cat="${esc(label)}">${esc(label)}</button>`;
      })
      .join("");

    const filtered = all.filter((article) => (!state.category || article.category === state.category) && (!state.q || matches(article, state.q)));
    const showFeatured = !state.category && !state.q;
    const featured = showFeatured ? all.find((article) => article.featured) || all[0] : null;
    const rest = filtered.filter((article) => !featured || article.slug !== featured.slug);

    featuredRoot.innerHTML = featured
      ? `<article class="featured-article" data-reveal="up">
          <div class="featured-article__media">${mediaHTML(IMG.journal[featured.image], { sizes: "(min-width: 768px) 55vw, 92vw", eager: true, width: 1200, height: 1000 })}</div>
          <div class="featured-article__copy">
            <div class="article-card__meta"><span class="badge badge--blush">${esc(featured.category)}</span><span>${esc(formatDate(featured.date))} · ${featured.readTime} min read</span></div>
            <h2 class="featured-article__title"><a href="${ROUTES.article(featured.slug)}">${esc(featured.title)}</a></h2>
            <p class="t-body">${esc(featured.excerpt)}</p>
            <a class="btn btn--ghost" href="${ROUTES.article(featured.slug)}" style="justify-self:start"><span class="btn__label">Read the article</span>${icon("arrow-right", "btn__icon")}</a>
          </div>
        </article>`
      : "";

    if (!filtered.length) {
      list.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__mark">${icon("search-x")}</div><h2 class="t-heading">No articles found</h2><p class="t-body">Try a different word or choose another category.</p><button class="btn" type="button" data-reset><span class="btn__label">Show all articles</span></button></div>`;
    } else {
      list.innerHTML = rest.map(cardHTML).join("");
    }
    refreshIcons();
    initReveals(featuredRoot);
    initReveals(list);
    setParams({ category: state.category || null, q: state.q || null });
  };

  nav.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-cat]");
    if (!chip) return;
    state.category = chip.dataset.cat === "All" ? "" : chip.dataset.cat;
    paint();
  });
  search.addEventListener(
    "input",
    debounce(() => {
      state.q = search.value.trim().slice(0, 80);
      paint();
    }, 160)
  );
  clear.addEventListener("click", () => {
    search.value = "";
    state.q = "";
    paint();
    search.focus();
  });
  list.addEventListener("click", (event) => {
    if (!event.target.closest("[data-reset]")) return;
    state.category = "";
    state.q = "";
    search.value = "";
    paint();
  });

  paint();
}

function initArticle() {
  const root = qs("#article-root");
  const article = getArticle(getSlug("journal") || "");
  if (!article) {
    applySEO({ title: "Article not found | AURELLE", description: "This article could not be found. Browse the AURELLE journal instead.", path: window.location.pathname, noindex: true });
    root.innerHTML = `<div class="not-found"><div class="empty-state__mark">${icon("search-x")}</div><h1 class="t-title">We could not find that article</h1><p class="t-body">It may have moved, or the link may be incomplete.</p><a class="btn" href="${ROUTES.journal}"><span class="btn__label">Back to the journal</span>${icon("arrow-right", "btn__icon")}</a></div>`;
    refreshIcons();
    return;
  }

  const products = productsForArticle(article);
  const related = relatedArticles(article, 3);
  const trail = [
    { label: "Home", href: ROUTES.home },
    { label: "Journal", href: ROUTES.journal },
    { label: article.title, href: ROUTES.article(article.slug) }
  ];

  const sections = article.sections
    .map((section) => {
      const body = (section.body || []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join("");
      const items = section.list ? `<ul>${section.list.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : "";
      const quote = section.quote ? `<blockquote>${esc(section.quote)}</blockquote>` : "";
      return `<h2>${esc(section.heading)}</h2>${body}${items}${quote}`;
    })
    .join("");

  root.innerHTML = `
    <div class="container article-hero">
      <nav aria-label="Breadcrumb"><ol class="breadcrumbs" style="justify-content:center">
        <li><a href="${ROUTES.home}">Home</a></li><li><a href="${ROUTES.journal}">Journal</a></li><li><span aria-current="page">${esc(article.category)}</span></li>
      </ol></nav>
      <div class="article-hero__head">
        <span class="badge badge--blush">${esc(article.category)}</span>
        <h1 class="article-hero__title" data-lines data-hero><span data-line>${esc(article.title)}</span></h1>
        <p class="article-hero__meta"><span>${esc(formatDate(article.date))}</span><span aria-hidden="true">·</span><span>${article.readTime} min read</span></p>
      </div>
      <div class="article-hero__media" data-reveal="arch" data-hero>${mediaHTML(IMG.journal[article.image], { sizes: "(min-width: 1024px) 80rem, 94vw", eager: true, priority: true, width: 1600, height: 1000 })}</div>
    </div>
    <div class="container article-body">
      <div class="article-main">
        <p class="article-body__intro">${esc(article.intro)}</p>
        <div class="prose" style="margin-top:var(--space-l)">${sections}</div>
      </div>
      <aside class="article-aside" aria-labelledby="aside-title">
        <h2 class="t-subheading" id="aside-title">Mentioned in this article</h2>
        ${products
          .map(
            (product) => `<a class="mini-product" href="${ROUTES.product(product.slug)}">
              <span class="mini-product__img">${mediaHTML(productImages(product)[0], { sizes: "5rem", width: 320, height: 400 })}</span>
              <span class="mini-product__name">${esc(product.name.replace("AURELLE ", ""))}</span>
              <span class="t-price">${hasPriceRange(product) ? "From " : ""}${esc(formatMoney(minPrice(product)))}</span>
            </a>`
          )
          .join("")}
      </aside>
    </div>
    <div class="container section">
      <div class="section-head section-head--split"><h2 class="t-title">Keep reading</h2><div class="section-head__aside"><a class="link" href="${ROUTES.journal}">All articles</a></div></div>
      <div class="article-grid">${related.map(cardHTML).join("")}</div>
    </div>`;
  refreshIcons();

  applySEO({
    title: `${article.title} | AURELLE Journal`,
    description: article.metaDescription,
    path: ROUTES.article(article.slug),
    image: pexelsUrl(IMG.journal[article.image].id, 1200),
    type: "article"
  });
  injectJSONLD("ld-article", articleLD(article, pexelsUrl(IMG.journal[article.image].id, 1200)));
  injectJSONLD("ld-breadcrumb", breadcrumbLD(trail));

  qsa("[data-lines]", root).forEach((node) => {
    const line = node.querySelector("[data-line]");
    if (line && !line.classList.contains("line")) {
      line.classList.add("line");
      line.innerHTML = `<span class="line__inner" style="--li:0">${line.innerHTML}</span>`;
    }
  });
  initReveals(root);
}

if (page === "article") initArticle();
else initLanding();
