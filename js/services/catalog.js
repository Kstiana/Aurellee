import { PRODUCTS } from "../data/products.js";
import { CATEGORIES, COLLECTIONS } from "../data/categories.js";
import { ARTICLES } from "../data/articles.js";
import { PRODUCT_IMAGES } from "../data/images.js";

const bySlug = new Map(PRODUCTS.map((product) => [product.slug, product]));
const byId = new Map(PRODUCTS.map((product) => [product.id, product]));

export const TYPE_LABELS = Object.freeze({
  shampoo: "Shampoo",
  conditioner: "Conditioner",
  mask: "Hair mask",
  oil: "Hair oil",
  "leave-in": "Leave-in",
  "heat-protectant": "Heat protection",
  wig: "Wig",
  bundles: "Bundles",
  bonnet: "Sleep bonnet",
  brush: "Brush"
});

export const COLLECTION_TYPE_LABELS = Object.freeze({
  wig: "Wigs",
  bundle: "Bundles"
});

export const AVAILABILITY = Object.freeze({
  "in-stock": { label: "In stock", state: "in", note: "Sample availability, confirmed when you place your request." },
  "low-stock": { label: "Low stock", state: "low", note: "Sample availability, confirmed when you place your request." },
  "made-to-order": { label: "Made to order", state: "in", note: "Made to order. Timing is confirmed when you place your request." }
});

export const SORT_OPTIONS = Object.freeze([
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Alphabetical" }
]);

export const getAllProducts = () => PRODUCTS.slice();
export const getProduct = (key) => bySlug.get(key) || byId.get(key) || null;
export const getCategory = (id) => CATEGORIES.find((category) => category.id === id) || null;
export const getCollection = (slug) => COLLECTIONS.find((collection) => collection.slug === slug) || null;
export const getVariant = (product, variantId) => (product ? product.variants.find((variant) => variant.id === variantId) || null : null);

export function defaultVariant(product) {
  const preferred = product.variants.find((variant) => variant.id === product.defaultVariant && variant.available);
  return preferred || product.variants.find((variant) => variant.available) || product.variants[0];
}

function pricePool(product) {
  const available = product.variants.filter((variant) => variant.available);
  return (available.length ? available : product.variants).map((variant) => variant.price);
}

export const minPrice = (product) => Math.min(...pricePool(product));
export const maxPrice = (product) => Math.max(...pricePool(product));
export const hasPriceRange = (product) => minPrice(product) !== maxPrice(product);
export const isPurchasable = (product) => product.variants.some((variant) => variant.available);
export const productImages = (product) => PRODUCT_IMAGES[product.imageSet] || PRODUCT_IMAGES.shampoo;
export const categoryName = (id) => (getCategory(id) ? getCategory(id).name : "");
export const typeLabel = (type) => TYPE_LABELS[type] || type;
export const availabilityInfo = (product) => AVAILABILITY[product.availability] || AVAILABILITY["in-stock"];
export const availabilityGroup = (product) => (product.availability === "made-to-order" ? "made-to-order" : "in-stock");

export const collectionForCategory = (categoryId) => COLLECTIONS.find((collection) => collection.categories.includes(categoryId)) || null;

export function productsInCollection(slug) {
  const collection = getCollection(slug);
  if (!collection) return [];
  return PRODUCTS.filter((product) => collection.categories.includes(product.category));
}

const normalise = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

function haystack(product) {
  return normalise(
    [
      product.name,
      categoryName(product.category),
      typeLabel(product.type),
      product.shortDescription,
      product.description,
      product.tags.join(" "),
      product.variants.map((variant) => variant.label).join(" ")
    ].join(" ")
  );
}

const haystacks = new Map(PRODUCTS.map((product) => [product.id, haystack(product)]));

export function matchesQuery(product, query) {
  const tokens = normalise(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const text = haystacks.get(product.id) || haystack(product);
  return tokens.every((token) => text.includes(token));
}

export function searchProducts(query, limit = 8) {
  const tokens = normalise(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  return PRODUCTS.filter((product) => matchesQuery(product, query))
    .map((product) => {
      const name = normalise(product.name);
      const score = tokens.reduce((total, token) => total + (name.includes(token) ? 3 : 1), 0);
      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
}

export function applyFilters(list, filters = {}) {
  const { categories = [], types = [], collectionTypes = [], availability = [], minPrice: low = null, maxPrice: high = null, query = "" } = filters;
  return list.filter((product) => {
    if (categories.length && !categories.includes(product.category)) return false;
    if (types.length && !types.includes(product.type)) return false;
    if (collectionTypes.length && !collectionTypes.includes(product.collectionType)) return false;
    if (availability.length && !availability.includes(availabilityGroup(product))) return false;
    if (low !== null && maxPrice(product) < low) return false;
    if (high !== null && minPrice(product) > high) return false;
    if (query && !matchesQuery(product, query)) return false;
    return true;
  });
}

export function sortProducts(list, sort = "featured") {
  const copy = list.slice();
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt) || a.bestseller - b.bestseller);
    case "price-asc":
      return copy.sort((a, b) => minPrice(a) - minPrice(b) || a.name.localeCompare(b.name));
    case "price-desc":
      return copy.sort((a, b) => minPrice(b) - minPrice(a) || a.name.localeCompare(b.name));
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured) || a.bestseller - b.bestseller);
  }
}

export function priceBounds(list) {
  if (!list.length) return { min: 0, max: 0 };
  return {
    min: Math.floor(Math.min(...list.map(minPrice))),
    max: Math.ceil(Math.max(...list.map(maxPrice)))
  };
}

export function bestsellers(limit = 6) {
  return PRODUCTS.slice()
    .sort((a, b) => a.bestseller - b.bestseller)
    .slice(0, limit);
}

export function relatedProducts(product, limit = 4) {
  const others = PRODUCTS.filter((item) => item.id !== product.id);
  const sameCategory = others.filter((item) => item.category === product.category);
  const sameType = others.filter((item) => item.category !== product.category && item.featured);
  const rest = others.filter((item) => !sameCategory.includes(item) && !sameType.includes(item));
  return [...sameCategory, ...sameType, ...rest].slice(0, limit);
}

export const getAllArticles = () => ARTICLES.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
export const getArticle = (slug) => ARTICLES.find((article) => article.slug === slug) || null;

export function relatedArticles(article, limit = 3) {
  const others = getAllArticles().filter((item) => item.slug !== article.slug);
  const same = others.filter((item) => item.category === article.category);
  return [...same, ...others.filter((item) => !same.includes(item))].slice(0, limit);
}

export const productsForArticle = (article) => article.products.map((slug) => getProduct(slug)).filter(Boolean);
