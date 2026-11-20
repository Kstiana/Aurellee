import { NETLIFY_FORMS, ROUTES, STORAGE_KEYS } from "../core/config.js";
import { esc, isValidEmail, qs } from "../core/utils.js";
import { storage } from "../services/storage.js";

export function newsletterHTML(id = "newsletter") {
  return `
    <form class="newsletter" name="${NETLIFY_FORMS.newsletter}" method="post" action="/" novalidate data-newsletter>
      <input type="hidden" name="form-name" value="${NETLIFY_FORMS.newsletter}">
      <p class="visually-hidden" aria-hidden="true"><label>Leave this field empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
      <div class="field" data-field>
        <label class="field__label visually-hidden" for="${esc(id)}-email">Email address</label>
        <div class="newsletter__row">
          <input class="field__input" id="${esc(id)}-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="Your email address" required aria-describedby="${esc(id)}-error">
          <button class="btn btn--light" type="submit" data-submit><span class="btn__label">Subscribe</span></button>
        </div>
        <p class="field__error" id="${esc(id)}-error" role="alert"></p>
      </div>
      <label class="check" data-consent-wrap>
        <input type="checkbox" name="consent" value="yes" required>
        <span>I agree to receive occasional emails from AURELLE and understand I can unsubscribe at any time. See the <a class="link" href="${ROUTES.privacy}">privacy policy</a>.</span>
      </label>
      <div class="form-status" role="status" data-status hidden></div>
    </form>`;
}

export function initNewsletter(scope = document) {
  scope.querySelectorAll("[data-newsletter]:not([data-ready])").forEach((form) => {
    form.setAttribute("data-ready", "");
    const email = qs('input[name="email"]', form);
    const consent = qs('input[name="consent"]', form);
    const field = qs("[data-field]", form);
    const error = qs(".field__error", form);
    const status = qs("[data-status]", form);
    const button = qs("[data-submit]", form);
    const label = qs(".btn__label", button);

    const setError = (message) => {
      field.classList.toggle("has-error", Boolean(message));
      error.textContent = message || "";
      email.setAttribute("aria-invalid", message ? "true" : "false");
    };

    const setStatus = (state, message) => {
      status.hidden = !message;
      status.dataset.state = state || "";
      status.textContent = message || "";
    };

    email.addEventListener("input", () => {
      if (field.classList.contains("has-error")) setError("");
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setStatus("", "");
      const value = email.value.trim();

      if (!isValidEmail(value)) {
        setError(value ? "Please enter a valid email address." : "Please enter your email address.");
        email.focus();
        return;
      }
      setError("");

      if (!consent.checked) {
        setStatus("error", "Please tick the box to confirm you would like to receive our emails.");
        consent.focus();
        return;
      }

      button.disabled = true;
      button.classList.add("is-loading");
      label.textContent = "Sending";

      try {
        const body = new URLSearchParams(new FormData(form)).toString();
        const response = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body
        });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        storage.set(STORAGE_KEYS.newsletter, { subscribedAt: Date.now() });
        form.reset();
        setStatus("success", "Thank you. Your details have been received.");
      } catch (failure) {
        setStatus("error", "We could not send your details just now. Please try again in a moment, or email us directly.");
      } finally {
        button.disabled = false;
        button.classList.remove("is-loading");
        label.textContent = "Subscribe";
      }
    });
  });
}
