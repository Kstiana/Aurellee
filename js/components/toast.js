import { esc, icon, refreshIcons, announce } from "../core/utils.js";

let stack = null;

function ensureStack() {
  if (stack && document.body.contains(stack)) return stack;
  stack = document.createElement("div");
  stack.className = "toast-stack";
  document.body.appendChild(stack);
  return stack;
}

export function showToast(message, options = {}) {
  const { type = "success", action = null, duration = 4200 } = options;
  const container = ensureStack();

  while (container.children.length >= 3) container.firstElementChild.remove();

  const toast = document.createElement("div");
  toast.className = `toast${type === "error" ? " toast--error" : ""}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.innerHTML = `
    ${icon(type === "error" ? "circle-alert" : "check", "toast__icon")}
    <span class="toast__text">${esc(message)}</span>
    ${action ? `<a class="toast__action" href="${esc(action.href)}">${esc(action.label)}</a>` : ""}`;
  container.appendChild(toast);
  refreshIcons();
  announce(message);

  const dismiss = () => {
    if (!toast.isConnected) return;
    toast.classList.add("is-leaving");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
    window.setTimeout(() => toast.remove(), 600);
  };

  let timer = window.setTimeout(dismiss, duration);
  toast.addEventListener("mouseenter", () => window.clearTimeout(timer));
  toast.addEventListener("mouseleave", () => {
    timer = window.setTimeout(dismiss, 1600);
  });

  return dismiss;
}
