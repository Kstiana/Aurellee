import { initFooter } from "../components/footer.js";
import { initHeader } from "../components/header.js";
import { watchMedia } from "../components/media.js";
import { initQuickView } from "../components/modal.js";
import { initMotion } from "../components/motion.js";
import { bindProductCards } from "../components/product-card.js";
import { runLoader, initPageTransitions } from "./router.js";
import { refreshIcons } from "./utils.js";

export function boot(options = {}) {
  const { hideFooterNewsletter = false } = options;
  runLoader();
  initPageTransitions();
  const header = initHeader();
  initFooter({ hideNewsletter: hideFooterNewsletter });
  initQuickView();
  bindProductCards();
  watchMedia();
  initMotion();
  refreshIcons();
  return header;
}
