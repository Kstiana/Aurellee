import { boot } from "../core/app.js";
import { ROUTES } from "../core/config.js";
import { applySEO, breadcrumbLD, injectJSONLD } from "../core/seo.js";
import { qs } from "../core/utils.js";
import { IMG } from "../data/images.js";
import { mediaHTML } from "../components/media.js";
import { initParallax, initReveals, initWordReveal } from "../components/motion.js";

boot();

applySEO({
  title: "About AURELLE | The Art of Beautiful Hair",
  description: "AURELLE is a considered haircare and beauty brand concept built around care, confidence and thoughtful selection. Discover our philosophy and approach.",
  path: ROUTES.about
});
injectJSONLD("ld-breadcrumb", breadcrumbLD([{ label: "Home", href: ROUTES.home }, { label: "About", href: ROUTES.about }]));

const fill = (name, slot, options) => {
  const node = qs(`[data-slot="${name}"]`);
  if (node) node.innerHTML = mediaHTML(slot, options);
};

fill("about-one", IMG.about.one, { sizes: "(min-width: 768px) 24rem, 40vw", eager: true, priority: true, width: 900, height: 1300 });
fill("about-two", IMG.about.two, { sizes: "(min-width: 768px) 16rem, 28vw", eager: true, width: 600, height: 960 });
fill("about-three", IMG.about.three, { sizes: "(min-width: 768px) 20rem, 32vw", eager: true, width: 800, height: 1100 });
fill("about-philosophy", IMG.philosophy.main, { sizes: "(min-width: 768px) 30rem, 90vw", width: 1000, height: 1300 });

initReveals();
initWordReveal();
initParallax();
