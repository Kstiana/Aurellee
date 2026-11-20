export const BRAND = Object.freeze({
  name: "AURELLE",
  tagline: "The Art of Beautiful Hair.",
  siteUrl: "https://aurelle.netlify.app",
  currency: "USD",
  locale: "en-US",
  whatsappNumber: "2348164845541",
  whatsappDisplay: "+234 816 484 5541",
  email: "kstiana1@gmail.com",
  social: Object.freeze({
    instagram: "",
    tiktok: "",
    pinterest: "",
    facebook: ""
  }),
  region: "Shipping worldwide on enquiry · Prices shown in USD",
  demoNotice: "AURELLE is a demonstration brand. Products, prices and policies shown here are illustrative."
});

export const CURRENCIES = Object.freeze({
  USD: { rate: 1, locale: "en-US", label: "US Dollar" }
});

export const CART_LIMITS = Object.freeze({
  minQty: 1,
  maxQty: 10,
  maxLines: 20
});

export const STORAGE_KEYS = Object.freeze({
  cart: "aurelle.cart.v1",
  wishlist: "aurelle.wishlist.v1",
  recent: "aurelle.recent.v1",
  preloader: "aurelle.preloader.v1",
  newsletter: "aurelle.newsletter.v1"
});

export const ROUTES = Object.freeze({
  home: "/",
  shop: "/shop",
  about: "/about",
  journal: "/journal",
  cart: "/cart",
  contact: "/contact",
  faq: "/faq",
  shipping: "/shipping-returns",
  privacy: "/privacy",
  terms: "/terms",
  collection: (slug) => `/collections/${slug}`,
  product: (slug) => `/product/${slug}`,
  article: (slug) => `/journal/${slug}`
});

export const COLLECTION_SLUGS = Object.freeze(["haircare", "styling", "wigs-extensions", "accessories"]);

export const SEO = Object.freeze({
  titleSuffix: "AURELLE",
  twitter: ""
});

export const NETLIFY_FORMS = Object.freeze({
  newsletter: "newsletter",
  contact: "contact"
});
