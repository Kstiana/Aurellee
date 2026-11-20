import { clamp, isFinePointer, onceVisible, prefersReducedMotion, qs, qsa, range, throttleFrame } from "../core/utils.js";

const ticks = new Set();
let listening = false;

function run() {
  ticks.forEach((fn) => fn());
}

const schedule = throttleFrame(run);

function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}

export function onFrame(fn) {
  ticks.add(fn);
  listen();
  fn();
  return () => ticks.delete(fn);
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initReveals(scope = document) {
  qsa("[data-stagger]:not([data-staggered])", scope).forEach((parent) => {
    parent.setAttribute("data-staggered", "");
    Array.from(parent.children).forEach((child, index) => {
      child.style.setProperty("--i", String(index));
      if (!child.hasAttribute("data-reveal")) child.setAttribute("data-reveal", "up");
    });
  });

  const targets = qsa("[data-reveal]:not([data-observed]), [data-lines]:not([data-observed])", scope);
  if (!targets.length) return;
  targets.forEach((node) => node.setAttribute("data-observed", ""));

  const ready = document.documentElement.classList.contains("is-ready");
  const reveal = (node) => node.classList.add("is-visible");
  const early = targets.filter((node) => node.hasAttribute("data-hero"));
  const regular = targets.filter((node) => !node.hasAttribute("data-hero"));

  if (early.length) {
    if (ready) early.forEach(reveal);
    else window.addEventListener("aurelle:ready", () => early.forEach(reveal), { once: true });
  }
  onceVisible(regular, reveal);
}

export function initLineSplits(scope = document) {
  qsa("[data-lines]:not([data-split])", scope).forEach((element) => {
    element.setAttribute("data-split", "");
    const lines = Array.from(element.querySelectorAll("[data-line]"));
    lines.forEach((line, index) => {
      const text = line.innerHTML;
      line.classList.add("line");
      line.innerHTML = `<span class="line__inner" style="--li:${index}">${text}</span>`;
    });
  });
}

export function initWordReveal(scope = document) {
  qsa("[data-words]:not([data-split])", scope).forEach((element) => {
    element.setAttribute("data-split", "");
    const text = element.textContent.trim();
    element.setAttribute("aria-label", text);
    element.innerHTML = text
      .split(/\s+/)
      .map((word) => `<span class="word" aria-hidden="true">${word}</span>`)
      .join(" ");
    if (prefersReducedMotion()) {
      qsa(".word", element).forEach((word) => word.style.setProperty("--wo", "1"));
      return;
    }
    const words = qsa(".word", element);
    onFrame(() => {
      const rect = element.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = range(vh * 0.88 - rect.top, 0, rect.height + vh * 0.32);
      const total = words.length;
      words.forEach((word, index) => {
        const local = clamp((progress * (total + 4) - index) / 4, 0, 1);
        word.style.setProperty("--wo", String(0.16 + local * 0.84));
      });
    });
  });
}

export function initParallax(scope = document) {
  if (prefersReducedMotion()) return;
  const items = qsa("[data-parallax]", scope);
  if (!items.length) return;
  onFrame(() => {
    const vh = window.innerHeight;
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      const factor = Number(item.dataset.parallax) || 0.1;
      const offset = (rect.top + rect.height / 2 - vh / 2) * factor * -1;
      item.style.setProperty("--py", `${offset.toFixed(1)}px`);
    });
  });
}

export function initMagnetic(scope = document) {
  if (!isFinePointer() || prefersReducedMotion()) return;
  qsa("[data-magnetic]:not([data-magnet-ready])", scope).forEach((button) => {
    button.setAttribute("data-magnet-ready", "");
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) * 0.22;
      const y = (event.clientY - (rect.top + rect.height / 2)) * 0.3;
      button.style.setProperty("--mx", `${x.toFixed(1)}px`);
      button.style.setProperty("--my", `${y.toFixed(1)}px`);
    });
    button.addEventListener("pointerleave", () => {
      button.style.setProperty("--mx", "0px");
      button.style.setProperty("--my", "0px");
    });
  });
}

export function initRails(scope = document) {
  qsa(".rail:not([data-rail-ready])", scope).forEach((rail) => {
    rail.setAttribute("data-rail-ready", "");
    const id = rail.id;
    const controls = id ? qsa(`[data-rail-for="${id}"]`) : [];
    const prev = controls.find((node) => node.hasAttribute("data-rail-prev"));
    const next = controls.find((node) => node.hasAttribute("data-rail-next"));

    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth - 2;
      if (prev) prev.disabled = rail.scrollLeft <= 2;
      if (next) next.disabled = rail.scrollLeft >= max;
    };

    const scrollByCard = (direction) => {
      const item = rail.querySelector(".rail__item");
      const step = item ? item.getBoundingClientRect().width + 16 : rail.clientWidth * 0.8;
      rail.scrollBy({ left: direction * step, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    };

    if (prev) prev.addEventListener("click", () => scrollByCard(-1));
    if (next) next.addEventListener("click", () => scrollByCard(1));
    rail.addEventListener("scroll", throttleFrame(update), { passive: true });
    window.addEventListener("resize", throttleFrame(update));
    update();

    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let moved = false;

    rail.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startScroll = rail.scrollLeft;
    });

    window.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 4) {
        moved = true;
        rail.classList.add("is-dragging");
      }
      if (moved) rail.scrollLeft = startScroll - delta;
    });

    const stop = () => {
      if (!dragging) return;
      dragging = false;
      window.setTimeout(() => rail.classList.remove("is-dragging"), 0);
    };

    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);

    rail.addEventListener(
      "click",
      (event) => {
        if (moved) {
          event.preventDefault();
          event.stopPropagation();
          moved = false;
        }
      },
      true
    );
  });
}

export function initRitual(section) {
  if (!section || prefersReducedMotion()) return;
  const steps = qsa(".ritual__step", section);
  const images = qsa(".ritual__img", section);
  const dots = qsa(".ritual__dot", section);
  const track = qs(".ritual__fill", section);
  if (!steps.length) return;
  section.style.setProperty("--steps", String(steps.length));
  let active = -1;

  const apply = (index) => {
    if (index === active) return;
    active = index;
    steps.forEach((step, i) => {
      step.classList.toggle("is-active", i === index);
      step.setAttribute("aria-hidden", i === index ? "false" : "true");
    });
    images.forEach((image, i) => {
      image.classList.toggle("is-active", i === index);
      image.classList.toggle("is-past", i < index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
      dot.setAttribute("aria-current", i === index ? "step" : "false");
    });
  };

  onFrame(() => {
    const rect = section.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const progress = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 0;
    const index = Math.min(Math.floor(progress * steps.length), steps.length - 1);
    apply(clamp(index, 0, steps.length - 1));
    if (track) section.style.setProperty("--p", progress.toFixed(3));
  });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const scrollable = section.offsetHeight - window.innerHeight;
      const target = top + (scrollable * (i + 0.5)) / steps.length;
      window.scrollTo({ top: target, behavior: "smooth" });
    });
  });
}

export function initCampaign(section) {
  if (!section || prefersReducedMotion()) return;
  const frame = qs(".campaign__frame", section);
  if (!frame) return;
  onFrame(() => {
    const rect = section.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const progress = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 1;
    const expand = ease(range(progress, 0.02, 0.62));
    frame.style.setProperty("--e", expand.toFixed(3));
  });
}

export function initMotion(scope = document) {
  initLineSplits(scope);
  initReveals(scope);
  initMagnetic(scope);
  initRails(scope);
}
