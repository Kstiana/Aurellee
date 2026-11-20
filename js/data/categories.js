export const CATEGORIES = Object.freeze([
  {
    id: "wash-care",
    name: "Wash & Care",
    short: "Cleanse and condition",
    description: "Gentle everyday cleansing and conditioning to begin the ritual."
  },
  {
    id: "treatments",
    name: "Treatments",
    short: "Masks and oils",
    description: "Slower, more indulgent steps for the moments you set aside for your hair."
  },
  {
    id: "styling",
    name: "Styling",
    short: "Prepare and protect",
    description: "Leave-in care and heat protection for the way you wear your hair."
  },
  {
    id: "hair-collection",
    name: "Wigs & Extensions",
    short: "Wigs and bundles",
    description: "A considered edit of wigs and bundles for length, volume and versatility."
  },
  {
    id: "accessories",
    name: "Accessories",
    short: "Tools and sleep care",
    description: "The small essentials that keep a routine feeling complete."
  }
]);

export const COLLECTIONS = Object.freeze([
  {
    slug: "haircare",
    title: "Haircare",
    categories: ["wash-care", "treatments"],
    intro: "Cleansers, conditioners, masks and oils chosen to make every wash day feel unhurried and well looked after.",
    metaTitle: "Haircare Collection | AURELLE",
    metaDescription: "Shop AURELLE haircare: gentle shampoo, silken conditioner, intensive masks and nourishing hair oil for a considered everyday ritual.",
    banner: "haircare",
    editorial: {
      title: "Care that begins with intention.",
      text: "Good haircare is rarely about doing more. It is about choosing a few things you enjoy using and returning to them. This edit keeps the steps simple, the textures pleasant and the routine easy to repeat.",
      link: { label: "Read the journal", href: "/journal" }
    }
  },
  {
    slug: "styling",
    title: "Styling",
    categories: ["styling"],
    intro: "Leave-in care and heat protection for smooth, polished finishes you can wear all day.",
    metaTitle: "Styling Collection | AURELLE",
    metaDescription: "Explore AURELLE styling essentials: silk leave-in cream and thermal shield for easy, polished everyday styling.",
    banner: "styling",
    editorial: {
      title: "Finish with a little polish.",
      text: "Styling is the last step of the ritual, and the one people see. These essentials prepare the hair before heat and help it look settled once you are done.",
      link: { label: "Everyday styling essentials", href: "/journal/everyday-hair-styling-essentials" }
    }
  },
  {
    slug: "wigs-extensions",
    title: "Wigs & Extensions",
    categories: ["hair-collection"],
    intro: "Signature wigs and natural wave bundles, offered in a small selection of lengths.",
    metaTitle: "Wigs & Extensions | AURELLE",
    metaDescription: "Discover AURELLE wigs and extensions: the Signature Straight Wig and Natural Wave Bundles in a considered range of lengths.",
    banner: "wigsExtensions",
    editorial: {
      title: "Length, volume and choice.",
      text: "Whether you wear a wig for protection, change or simply because you love it, the right piece should feel natural and be easy to care for. Our guide covers the basics.",
      link: { label: "A guide to caring for your wigs", href: "/journal/guide-to-caring-for-your-wigs" }
    }
  },
  {
    slug: "accessories",
    title: "Accessories",
    categories: ["accessories"],
    intro: "Satin sleep care and a well-made brush, the quiet details that round out a routine.",
    metaTitle: "Hair Accessories | AURELLE",
    metaDescription: "Shop AURELLE accessories: the Satin Sleep Bonnet and Signature Hair Brush for a complete haircare ritual.",
    banner: "accessories",
    editorial: {
      title: "The small things that stay.",
      text: "Accessories are the pieces you reach for without thinking. We keep the selection tight, so each one earns its place on your shelf or beside your bed.",
      link: { label: "Beauty in consistency", href: "/journal/the-beauty-of-consistent-haircare" }
    }
  }
]);

export const NAV_DESTINATIONS = Object.freeze([
  { label: "Shop all", href: "/shop", note: "10 pieces" },
  { label: "Haircare", href: "/collections/haircare", note: "Wash, condition, treat" },
  { label: "Styling", href: "/collections/styling", note: "Prepare and protect" },
  { label: "Wigs & Extensions", href: "/collections/wigs-extensions", note: "Wigs and bundles" },
  { label: "Accessories", href: "/collections/accessories", note: "Sleep and tools" }
]);
