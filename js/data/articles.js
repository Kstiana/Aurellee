export const ARTICLE_CATEGORIES = Object.freeze([
  "Haircare Education",
  "Hair Treatments",
  "Hair Styling",
  "Wig Care",
  "Beauty & Lifestyle"
]);

export const ARTICLES = Object.freeze([
  {
    slug: "building-your-haircare-ritual",
    title: "Building Your Haircare Ritual",
    category: "Haircare Education",
    date: "2026-03-02",
    readTime: 5,
    image: "ritual",
    featured: true,
    excerpt: "A simple five-step order for wash day, and why a short routine you enjoy beats a long one you skip.",
    metaDescription: "A calm, simple guide to building a haircare ritual: cleanse, condition, treat, style and finish, with easy ways to make it stick.",
    intro: "A ritual is just a routine you look forward to. You do not need a shelf full of products to have one. You need a clear order, a few things you like using, and a little time.",
    sections: [
      {
        heading: "Start with the order",
        body: [
          "Most routines follow the same sequence. Cleanse the scalp and lengths, condition the mid-lengths and ends, add a treatment when your hair asks for one, prepare it for styling, then finish with something light.",
          "Once the order feels natural, you can swap individual products without disturbing the rhythm."
        ]
      },
      {
        heading: "The five steps, simply",
        list: [
          "Cleanse: wash the scalp gently and let the lather rinse through the lengths.",
          "Condition: apply from mid-lengths to ends, comb through and rinse.",
          "Treat: use a mask or oil when your hair feels dry or well-worn.",
          "Style: prepare damp hair with a leave-in, and use heat protection if you plan to use heat.",
          "Finish: a few drops of oil on the ends can add softness and a little shine."
        ]
      },
      {
        heading: "Make it easy to repeat",
        body: [
          "Keep products where you will see them. Choose a regular wash day. Start with two steps and add a third only when the first two feel effortless.",
          "Hair is individual, so treat any routine as a starting point and adjust it to how your hair feels over a few weeks."
        ],
        quote: "A short routine you enjoy will always beat a long one you skip."
      }
    ],
    products: ["gentle-cleansing-shampoo", "silken-conditioner", "nourishing-hair-oil"]
  },
  {
    slug: "understanding-hair-oils",
    title: "Understanding Hair Oils",
    category: "Hair Treatments",
    date: "2026-02-20",
    readTime: 4,
    image: "oils",
    featured: false,
    excerpt: "Pre-wash, finishing or in between: where oil fits, how much to use and why a little goes a long way.",
    metaDescription: "How to use hair oil: when to apply it, how much you need and how to choose a light finishing oil for everyday use.",
    intro: "Hair oil is one of the easiest products to overuse and one of the most pleasant to get right. The secret is simply to use less than you think you need.",
    sections: [
      {
        heading: "Where oil fits in your routine",
        body: [
          "Oil can be used before washing as a pre-wash treatment, on damp hair to help smooth the lengths, or on dry hair as a finish. Each approach gives a different result, so it helps to try one at a time.",
          "A finishing oil is usually the lightest option and the easiest to start with."
        ]
      },
      {
        heading: "How much to use",
        list: [
          "Begin with two or three drops warmed between your palms.",
          "Smooth through the ends first, then the mid-lengths.",
          "Keep oil away from the roots unless you know your scalp likes it.",
          "Add more only if the ends still feel dry."
        ]
      },
      {
        heading: "A note on trying new products",
        body: [
          "If you have sensitive skin or known allergies, check the label of any new product and patch test before wide use. If you notice irritation, stop using it."
        ]
      }
    ],
    products: ["nourishing-hair-oil", "intensive-hair-mask"]
  },
  {
    slug: "guide-to-caring-for-your-wigs",
    title: "A Guide to Caring for Your Wigs",
    category: "Wig Care",
    date: "2026-02-08",
    readTime: 6,
    image: "wigs",
    featured: false,
    excerpt: "Brushing, washing, storing and wearing: the habits that help a wig look good for longer.",
    metaDescription: "A practical guide to wig care: how to brush, wash, dry and store a wig so it keeps its shape and finish.",
    intro: "A good wig rewards a little attention. These are general habits that suit most wigs, but always follow the maker's guidance for your specific piece.",
    sections: [
      {
        heading: "Brush gently, from the ends",
        body: [
          "Hold the hair near the cap and start at the ends, working upward in small sections. This avoids pulling on tangles and helps keep the style in shape."
        ]
      },
      {
        heading: "Washing and drying",
        list: [
          "Wash only when needed, using a mild cleanser and lukewarm water.",
          "Press, do not wring. Let it drain.",
          "Air-dry on a stand away from direct heat.",
          "Use heat tools only if the wig is made to be heat-friendly."
        ]
      },
      {
        heading: "Store it well",
        body: [
          "Keep your wig on a stand or in a breathable bag when you are not wearing it. Avoid sleeping in it and keep it away from cooking heat and smoke."
        ],
        quote: "How you put a wig away matters as much as how you wear it."
      }
    ],
    products: ["signature-straight-wig", "natural-wave-bundles", "satin-sleep-bonnet"]
  },
  {
    slug: "everyday-hair-styling-essentials",
    title: "Everyday Hair Styling Essentials",
    category: "Hair Styling",
    date: "2026-01-30",
    readTime: 4,
    image: "styling",
    featured: false,
    excerpt: "The small kit behind most good hair days: a leave-in, heat protection and a brush you like.",
    metaDescription: "The everyday hair styling essentials: leave-in cream, heat protection and a good brush, with simple tips for a polished finish.",
    intro: "You do not need many tools for a polished finish. A short list of dependable essentials will cover most of what you do.",
    sections: [
      {
        heading: "Prepare before you style",
        body: [
          "Apply a leave-in to towel-dried hair and comb it through. Starting with smooth, evenly coated hair makes everything that follows easier."
        ]
      },
      {
        heading: "Respect the heat",
        list: [
          "Apply heat protection before blow-drying or using hot tools.",
          "Use the lowest temperature that gives you the result you want.",
          "Do not pass the same section over and over."
        ]
      },
      {
        heading: "Finish with a brush you enjoy",
        body: [
          "A well-balanced brush with flexible bristles makes detangling quicker and more comfortable. It also becomes a small, pleasant part of the day."
        ]
      }
    ],
    products: ["silk-leave-in-cream", "thermal-shield", "signature-hair-brush"]
  },
  {
    slug: "the-beauty-of-consistent-haircare",
    title: "The Beauty of Consistent Haircare",
    category: "Beauty & Lifestyle",
    date: "2026-01-16",
    readTime: 4,
    image: "consistency",
    featured: false,
    excerpt: "Why steady, ordinary habits tend to matter more than dramatic one-off fixes.",
    metaDescription: "A short reflection on consistent haircare: small, repeatable habits and why a calm routine is easier to keep.",
    intro: "Most of us look for a single product that will change everything. In practice, the thing that helps most is rarely dramatic. It is simply turning up for your hair regularly.",
    sections: [
      {
        heading: "Small habits add up",
        body: [
          "Washing gently, combing carefully, protecting your hair at night and trimming when needed are all quiet habits. None of them is exciting, and together they do a great deal."
        ]
      },
      {
        heading: "Make it pleasant",
        body: [
          "We keep habits that feel good. Choose textures and scents you enjoy, and give wash day a fixed place in your week. When care feels like a treat, consistency stops being a chore."
        ],
        quote: "Care is not a task to finish. It is something to return to."
      }
    ],
    products: ["satin-sleep-bonnet", "silken-conditioner"]
  }
]);
