import { BRAND, ROUTES, SEO } from "./config.js";
import { IMG, pexelsUrl } from "../data/images.js";
import { hasPriceRange, maxPrice, minPrice, productImages, categoryName } from "../services/catalog.js";

const absolute = (path) => (/^https?:/.test(path) ? path : `${BRAND.siteUrl}${path.startsWith("/") ? path : `/${path}`}`);

function setTag(selector, create, attribute, value) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = create();
    document.head.appendChild(node);
  }
  node.setAttribute(attribute, value);
}

const meta = (name, content) => setTag(`meta[name="${name}"]`, () => Object.assign(document.createElement("meta"), { name }), "content", content);
const property = (name, content) =>
  setTag(`meta[property="${name}"]`, () => {
    const node = document.createElement("meta");
    node.setAttribute("property", name);
    return node;
  }, "content", content);

export function applySEO({ title, description, path, image, type = "website", noindex = false }) {
  const fullTitle = title.includes(SEO.titleSuffix) ? title : `${title} | ${SEO.titleSuffix}`;
  const url = absolute(path || window.location.pathname);
  const picture = image || pexelsUrl(IMG.og.id, 1200);

  document.title = fullTitle;
  meta("description", description);
  meta("robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
  setTag('link[rel="canonical"]', () => Object.assign(document.createElement("link"), { rel: "canonical" }), "href", url);

  property("og:site_name", BRAND.name);
  property("og:type", type);
  property("og:title", fullTitle);
  property("og:description", description);
  property("og:url", url);
  property("og:image", picture);
  property("og:locale", BRAND.locale.replace("-", "_"));
  meta("twitter:card", "summary_large_image");
  meta("twitter:title", fullTitle);
  meta("twitter:description", description);
  meta("twitter:image", picture);
}

export function injectJSONLD(id, data) {
  let node = document.getElementById(id);
  if (!node) {
    node = document.createElement("script");
    node.type = "application/ld+json";
    node.id = id;
    document.head.appendChild(node);
  }
  node.textContent = JSON.stringify(data);
}

export function breadcrumbLD(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absolute(item.href)
    }))
  };
}

export function productLD(product) {
  const images = productImages(product).map((slot) => pexelsUrl(slot.id, 1200));
  const offer = hasPriceRange(product)
    ? {
        "@type": "AggregateOffer",
        priceCurrency: product.currency,
        lowPrice: minPrice(product),
        highPrice: maxPrice(product),
        offerCount: product.variants.filter((variant) => variant.available).length,
        url: absolute(ROUTES.product(product.slug))
      }
    : {
        "@type": "Offer",
        priceCurrency: product.currency,
        price: minPrice(product),
        url: absolute(ROUTES.product(product.slug))
      };
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    category: categoryName(product.category),
    image: images,
    brand: { "@type": "Brand", name: BRAND.name },
    offers: offer
  };
}

export function articleLD(article, imageUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.date,
    dateModified: article.date,
    image: [imageUrl],
    articleSection: article.category,
    author: { "@type": "Organization", name: BRAND.name },
    publisher: { "@type": "Organization", name: BRAND.name },
    mainEntityOfPage: absolute(ROUTES.article(article.slug))
  };
}

export function organizationLD() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: BRAND.siteUrl,
    slogan: BRAND.tagline,
    email: BRAND.email
  };
}

export function websiteLD() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: BRAND.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BRAND.siteUrl}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}
