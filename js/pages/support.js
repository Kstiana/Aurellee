import { boot } from "../core/app.js";
import { BRAND, ROUTES } from "../core/config.js";
import { applySEO, breadcrumbLD, injectJSONLD } from "../core/seo.js";
import { esc, icon, isValidEmail, qs, qsa, refreshIcons } from "../core/utils.js";
import { initReveals } from "../components/motion.js";
import { buildGeneral } from "../services/whatsapp.js";

boot();

const page = document.body.dataset.page;
const SEO_BY_PAGE = {
  contact: { title: "Contact AURELLE", description: "Get in touch with AURELLE by WhatsApp, email or the contact form. We reply to every message.", path: ROUTES.contact, label: "Contact" },
  faq: { title: "Frequently Asked Questions | AURELLE", description: "Answers to common questions about AURELLE products, ordering by WhatsApp, shipping, returns and customer care.", path: ROUTES.faq, label: "FAQ" },
  shipping: { title: "Shipping & Returns | AURELLE", description: "Sample shipping and returns information for the AURELLE demonstration store, with clear notes on what is confirmed per order.", path: ROUTES.shipping, label: "Shipping & returns" },
  privacy: { title: "Privacy Policy | AURELLE", description: "How the AURELLE demonstration website handles your information, including local storage, forms and WhatsApp ordering.", path: ROUTES.privacy, label: "Privacy" },
  terms: { title: "Terms & Conditions | AURELLE", description: "Sample terms and conditions for the AURELLE demonstration website and its WhatsApp ordering flow.", path: ROUTES.terms, label: "Terms" }
};

const config = SEO_BY_PAGE[page];
if (config) {
  applySEO({ title: config.title, description: config.description, path: config.path });
  injectJSONLD("ld-breadcrumb", breadcrumbLD([{ label: "Home", href: ROUTES.home }, { label: config.label, href: config.path }]));
} else if (page === "error") {
  applySEO({ title: "Page not found | AURELLE", description: "The page you were looking for could not be found. Return to the AURELLE collection.", path: "/404", noindex: true });
}

function initContact() {
  const cards = qs("[data-contact-cards]");
  if (cards) {
    const whatsapp = buildGeneral();
    cards.innerHTML = `
      <a class="contact-card" href="${esc(whatsapp.url)}" target="_blank" rel="noopener noreferrer">
        <span class="contact-card__icon">${icon("message-circle")}</span>
        <span><span class="contact-card__label">WhatsApp</span><span class="contact-card__value">${esc(BRAND.whatsappDisplay)}</span></span>
        ${icon("arrow-up-right")}
      </a>
      <a class="contact-card" href="mailto:${esc(BRAND.email)}">
        <span class="contact-card__icon">${icon("mail")}</span>
        <span><span class="contact-card__label">Email</span><span class="contact-card__value">${esc(BRAND.email)}</span></span>
        ${icon("arrow-up-right")}
      </a>
      <a class="contact-card" href="${ROUTES.faq}">
        <span class="contact-card__icon">${icon("circle-help")}</span>
        <span><span class="contact-card__label">Quick answers</span><span class="contact-card__value">Read the FAQ</span></span>
        ${icon("arrow-right")}
      </a>`;
    refreshIcons();
  }

  const form = qs("[data-contact-form]");
  if (!form) return;
  const status = qs("[data-status]", form);
  const button = qs("[data-submit]", form);
  const label = qs(".btn__label", button);

  const fields = {
    name: { el: qs('[name="name"]', form), check: (value) => (value.trim().length >= 2 ? "" : "Please tell us your name.") },
    email: { el: qs('[name="email"]', form), check: (value) => (isValidEmail(value) ? "" : "Please enter a valid email address.") },
    message: { el: qs('[name="message"]', form), check: (value) => (value.trim().length >= 10 ? "" : "Please write a short message of at least 10 characters.") }
  };

  const setFieldError = (key, message) => {
    const { el } = fields[key];
    const wrap = el.closest(".field");
    wrap.classList.toggle("has-error", Boolean(message));
    qs(".field__error", wrap).textContent = message;
    el.setAttribute("aria-invalid", message ? "true" : "false");
  };

  Object.entries(fields).forEach(([key, { el, check }]) => {
    el.addEventListener("blur", () => setFieldError(key, check(el.value)));
    el.addEventListener("input", () => {
      if (el.closest(".field").classList.contains("has-error")) setFieldError(key, check(el.value));
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.hidden = true;
    let firstInvalid = null;
    Object.entries(fields).forEach(([key, { el, check }]) => {
      const message = check(el.value);
      setFieldError(key, message);
      if (message && !firstInvalid) firstInvalid = el;
    });
    const consent = qs('[name="consent"]', form);
    if (!firstInvalid && !consent.checked) {
      status.hidden = false;
      status.dataset.state = "error";
      status.textContent = "Please tick the box to confirm we may reply to you using these details.";
      consent.focus();
      return;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    button.disabled = true;
    label.textContent = "Sending";
    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      const response = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      form.reset();
      status.hidden = false;
      status.dataset.state = "success";
      status.textContent = "Thank you. Your message has been received and we will reply as soon as we can.";
    } catch (failure) {
      status.hidden = false;
      status.dataset.state = "error";
      status.innerHTML = `We could not send your message just now. Please try again, or write to us at <a class="link" href="mailto:${esc(BRAND.email)}">${esc(BRAND.email)}</a>.`;
    } finally {
      button.disabled = false;
      label.textContent = "Send message";
    }
  });
}

function initFaq() {
  const tabs = qs("[data-faq-tabs]");
  const groups = qsa("[data-faq-group]");
  if (!tabs || !groups.length) return;
  const names = groups.map((group) => group.dataset.faqGroup);
  tabs.innerHTML = ["All", ...names].map((name) => `<button class="chip" type="button" aria-pressed="${name === "All"}" data-faq-tab="${esc(name)}">${esc(name)}</button>`).join("");
  tabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-faq-tab]");
    if (!tab) return;
    qsa("[data-faq-tab]", tabs).forEach((chip) => chip.setAttribute("aria-pressed", String(chip === tab)));
    groups.forEach((group) => {
      group.hidden = tab.dataset.faqTab !== "All" && group.dataset.faqGroup !== tab.dataset.faqTab;
    });
  });
}

if (page === "contact") initContact();
if (page === "faq") initFaq();
initReveals();
