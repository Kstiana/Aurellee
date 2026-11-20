import { BRAND, ROUTES } from "../core/config.js";
import { esc, icon, onceVisible, qs, refreshIcons } from "../core/utils.js";
import { buildGeneral } from "../services/whatsapp.js";
import { initNewsletter, newsletterHTML } from "./newsletter.js";

const SOCIAL_ICONS = { instagram: "instagram", facebook: "facebook" };

function socialLinks() {
  const configured = Object.entries(BRAND.social)
    .filter(([name, url]) => url && SOCIAL_ICONS[name])
    .map(([name, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)}">${icon(SOCIAL_ICONS[name])}</a>`)
    .join("");
  return `
    <a href="${esc(buildGeneral().url)}" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">${icon("message-circle")}</a>
    <a href="mailto:${esc(BRAND.email)}" aria-label="Email AURELLE">${icon("mail")}</a>
    ${configured}`;
}

function markup(options) {
  const year = new Date().getFullYear();
  const letters = BRAND.name.split("").map((letter, index) => `<span style="--i:${index}">${esc(letter)}</span>`).join("");
  return `
    <footer class="site-footer is-dark" id="site-footer">
      <div class="container">
        <div class="site-footer__top">
          <div class="site-footer__brand">
            <p class="site-footer__tagline">Your hair deserves a little more.</p>
            <p class="t-small" style="color:var(--text-on-dark-soft)">Thoughtfully curated hair essentials, made to turn haircare into a ritual worth returning to.</p>
            ${options.hideNewsletter ? "" : `<div class="stack stack--s" style="margin-top:var(--space-s)"><p class="site-footer__title" style="margin:0">A little beauty in your inbox</p>${newsletterHTML("footer")}</div>`}
            <div class="site-footer__social">${socialLinks()}</div>
          </div>
          <div class="site-footer__cols">
            <nav aria-label="Shop">
              <p class="site-footer__title">Shop</p>
              <ul class="site-footer__list">
                <li><a href="${ROUTES.shop}">Shop all</a></li>
                <li><a href="${ROUTES.collection("haircare")}">Haircare</a></li>
                <li><a href="${ROUTES.collection("styling")}">Styling</a></li>
                <li><a href="${ROUTES.collection("wigs-extensions")}">Wigs &amp; Extensions</a></li>
                <li><a href="${ROUTES.collection("accessories")}">Accessories</a></li>
              </ul>
            </nav>
            <nav aria-label="Customer care">
              <p class="site-footer__title">Care</p>
              <ul class="site-footer__list">
                <li><a href="${ROUTES.contact}">Contact</a></li>
                <li><a href="${ROUTES.faq}">FAQ</a></li>
                <li><a href="${ROUTES.shipping}">Shipping &amp; returns</a></li>
                <li><a href="${ROUTES.cart}">Your bag</a></li>
              </ul>
            </nav>
            <nav aria-label="About AURELLE">
              <p class="site-footer__title">AURELLE</p>
              <ul class="site-footer__list">
                <li><a href="${ROUTES.about}">About</a></li>
                <li><a href="${ROUTES.journal}">Journal</a></li>
                <li><a href="mailto:${esc(BRAND.email)}">${esc(BRAND.email)}</a></li>
                <li><a href="${esc(buildGeneral().url)}" target="_blank" rel="noopener noreferrer">${esc(BRAND.whatsappDisplay)}</a></li>
              </ul>
            </nav>
          </div>
        </div>
        <div class="site-footer__giant" aria-hidden="true" data-giant>${letters}</div>
        <div class="site-footer__bottom">
          <div class="stack stack--s">
            <p>&copy; ${year} ${esc(BRAND.name)}</p>
            <p class="region-note">${icon("globe")}<span>${esc(BRAND.region)}</span></p>
          </div>
          <ul class="site-footer__legal">
            <li><a href="${ROUTES.privacy}">Privacy</a></li>
            <li><a href="${ROUTES.terms}">Terms</a></li>
            <li><a href="${ROUTES.shipping}">Shipping &amp; returns</a></li>
          </ul>
        </div>
      </div>
    </footer>`;
}

export function initFooter(options = {}) {
  const existing = qs("#site-footer");
  if (existing) existing.remove();
  const holder = document.createElement("div");
  holder.innerHTML = markup(options);
  const footer = holder.firstElementChild;
  const anchor = qs("[data-footer-root]");
  if (anchor) anchor.replaceWith(footer);
  else document.body.appendChild(footer);
  refreshIcons();
  initNewsletter(footer);
  const giant = qs("[data-giant]", footer);
  if (giant) onceVisible(giant, (node) => node.classList.add("is-visible"), { threshold: 0.3 });
}
