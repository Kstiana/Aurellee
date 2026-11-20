import { esc, qsa } from "../core/utils.js";
import { pexelsUrl, srcset } from "../data/images.js";

export function mediaHTML(slot, options = {}) {
  const { sizes = "100vw", eager = false, className = "", width = 800, height = 1000, alt = slot.alt, priority = false } = options;
  const loading = eager ? "eager" : "lazy";
  const fetchPriority = priority ? ' fetchpriority="high"' : "";
  return `<div class="media${className ? ` ${esc(className)}` : ""}" data-img-id="${esc(slot.id)}"><img src="${esc(pexelsUrl(slot.id, width))}" srcset="${esc(srcset(slot.id))}" sizes="${esc(sizes)}" alt="${esc(alt)}" width="${width}" height="${height}" loading="${loading}" decoding="async"${fetchPriority} style="object-position:${esc(slot.position)}"></div>`;
}

export function imgAttrs(slot, width = 800) {
  return { src: pexelsUrl(slot.id, width), srcset: srcset(slot.id), alt: slot.alt, position: slot.position };
}

function bind(img) {
  const wrapper = img.closest(".media");
  const ok = () => {
    img.classList.add("is-loaded");
    if (wrapper) wrapper.classList.remove("is-missing");
  };
  const fail = () => {
    img.classList.remove("is-loaded");
    if (wrapper) wrapper.classList.add("is-missing");
  };
  if (img.complete) {
    if (img.naturalWidth > 0) ok();
    else if (img.getAttribute("src")) fail();
    return;
  }
  img.addEventListener("load", ok, { once: true });
  img.addEventListener("error", fail, { once: true });
}

export function mountMedia(scope = document) {
  qsa(".media > img:not([data-bound])", scope).forEach((img) => {
    img.setAttribute("data-bound", "");
    bind(img);
  });
}

export function watchMedia() {
  mountMedia(document);
  if (!("MutationObserver" in window)) return;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches(".media > img")) {
          if (!node.hasAttribute("data-bound")) {
            node.setAttribute("data-bound", "");
            bind(node);
          }
        }
        if (node.querySelectorAll) mountMedia(node);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
