const IMGUR_BASE = "https://i.imgur.com";

export const POOL = Object.freeze({
  editorialWoman: "KyLrqYr",
  hero: "nQHn7AY",
  care: "0DYuemU",
  Drop: "PtlWTXN",
  chip: "Kx2Vx24",
  bottles: "WYc01gd",
  wavy: "wsNzeOH",
  still: "JHor5ZQ",
  curly: "YWBzfPO",
  silk: "0aSmyOj",
  pump: "DSO3NRI",
  oil: "LmP1INC",
  comb: "dI76B1a",
  stand: "TaYtUMD",
  sleep: "AWOO6pi",
  long: "GCTsfnr",
  petal: "UnfzDip",
  waveRose: "7sMPKQj",
  wave: "YWBzfPO",
  texture: "nypc991",
  fabric: "lk2iO6b",
  portrait: "EKUnQCC",
  maskJar: "92qbERP",
  maskHands: "weX3gVW",
  maskPetals: "Jxzn4D1",
  oilHands: "qoHwFu7",
  oilPetals: "9BW4jkV",
  leaveBottle: "eaTdL8s",
  leaveHair: "OPoNEwg",
  leaveJar: "IoDVjrz",
  curlyPortrait: "Qu3ZNMI",
  longHairBack: "wsNzeOH",
  salonWash: "ylUj523",
  careHands: "HmZz0ww",
  oilDropper: "PtlWTXN",
  bottlesPink: "mYxoBvF",
  pink: "Os6tp1f",
  pumpBottle: "F6TlzF9",
  creamJar: "cHzxXTk",
  brushComb: "WlnAQfG",
  stillFabric: "9LQBrcx",
  silkTexture: "OryYtsu",
  sleepBonnet: "efxolnE",
  wigStand: "nQHn7AY",
  wavyHair: "mg50pfa",
  rosee: "y8CFhX6",
  petals: "gp2Vzq0",
  whiteTop: "CBACTAd"
});

export function pexelsUrl(id, width = 900) {
  return `${IMGUR_BASE}/${id}.jpg`;
}

export const WIDTHS = Object.freeze([480, 800, 1200, 1600]);

export function srcset(id) {
  return WIDTHS.map((width) => `${pexelsUrl(id, width)} ${width}w`).join(", ");
}

const slot = (pool, alt, position = "50% 50%") =>
  Object.freeze({
    id: POOL[pool],
    alt,
    position
  });

export const IMG = Object.freeze({
  hero: slot("hero", "A woman with softly waved hair in warm natural light", "50% 30%"),
  heroOval: slot("care", "Hands working a hair treatment through the lengths", "50% 50%"),
  heroChip: slot("chip", "Amber glass dropper bottle on a soft pink surface", "50% 50%"),
  menu: Object.freeze({
    shop: slot("bottles", "A row of haircare bottles on a blush backdrop"),
    collections: slot("wavy", "Loose natural waves catching the light", "50% 35%"),
    journal: slot("still", "Folded fabric and a brush in a quiet still life"),
    about: slot("curly", "A portrait of a woman with defined curls", "50% 30%"),
    contact: slot("silk", "Soft satin fabric in warm tones")
  }),
  categories: Object.freeze({
    haircare: slot("pump", "A pump bottle of shampoo on a neutral surface"),
    treatments: slot("oil", "A hair oil dropper bottle beside a petal"),
    styling: slot("comb", "A brush and comb laid out for styling"),
    wigs: slot("stand", "A long wig displayed on a stand", "50% 30%"),
    accessories: slot("sleep", "A satin sleep bonnet folded on a soft surface")
  }),
  philosophy: Object.freeze({
    main: slot("long", "A woman seen from behind with long, healthy-looking hair", "50% 25%"),
    small: slot("petal", "Rose petals scattered on a pale surface")
  }),
  ritual: Object.freeze({
    cleanse: slot("salonWash", "Hair being rinsed at a wash basin", "50% 40%"),
    condition: slot("creamJar", "A cream jar with a smooth, creamy texture"),
    treat: slot("careHands", "Hands massaging a treatment into hair", "50% 45%"),
    style: slot("brushComb", "A hairbrush and comb ready to style"),
    finish: slot("waveRose", "Finished, softly waved hair with natural shine", "50% 30%")
  }),
  campaign: slot("wave", "A woman with glossy, softly waved hair in a campaign portrait", "50% 30%"),
  journal: Object.freeze({
    ritual: slot("careHands", "Hands massaging a treatment into hair"),
    oils: slot("oilDropper", "A dropper bottle of hair oil"),
    wigs: slot("wigStand", "A wig displayed on a stand", "50% 30%"),
    styling: slot("brushComb", "A brush and comb on a soft surface"),
    consistency: slot("whiteTop", "A woman with long hair, relaxed in soft light", "50% 25%")
  }),
  about: Object.freeze({
    one: slot("portrait", "A portrait of a woman with defined curls", "50% 30%"),
    two: slot("texture", "Soft satin fabric in warm tones"),
    three: slot("fabric", "A quiet still life of fabric and hair tools")
  }),
  collections: Object.freeze({
    haircare: slot("bottlesPink", "Haircare bottles arranged on a blush backdrop"),
    styling: slot("brushComb", "Styling tools arranged on a soft surface"),
    wigsExtensions: slot("wavyHair", "Loose natural waves in soft light", "50% 35%"),
    accessories: slot("sleepBonnet", "Satin accessories folded on a neutral surface")
  }),
  contact: slot("texture", "Soft satin fabric in warm tones"),
  error: slot("petal", "Rose petals scattered on a pale surface"),
  og: slot("editorialWoman", "AURELLE luxury haircare and beauty essentials", "50% 30%")
});

export const PRODUCT_IMAGES = Object.freeze({
  shampoo: Object.freeze([
    slot("pumpBottle", "AURELLE Gentle Cleansing Shampoo bottle"),
    slot("salonWash", "Hair being washed with a gentle shampoo", "50% 40%"),
    slot("pink", "AURELLE shampoo in a blush haircare arrangement")
  ]),
  conditioner: Object.freeze([
    slot("creamJar", "AURELLE Silken Conditioner in a soft setting"),
    slot("careHands", "Conditioner being worked through the lengths", "50% 45%"),
    slot("bottlesPink", "AURELLE conditioner in a blush haircare arrangement")
  ]),
  mask: Object.freeze([
    slot("maskJar", "AURELLE Intensive Hair Mask jar"),
    slot("maskHands", "A hair mask being applied by hand", "50% 45%"),
    slot("maskPetals", "Rose petals beside a treatment jar")
  ]),
  oil: Object.freeze([
    slot("oilDropper", "AURELLE Nourishing Hair Oil dropper bottle"),
    slot("oilPetals", "Hair oil with rose petals on a pale surface"),
    slot("oilHands", "Hair oil being smoothed through the ends", "50% 45%")
  ]),
  leaveIn: Object.freeze([
    slot("leaveBottle", "AURELLE Silk Leave-In Cream bottle"),
    slot("leaveHair", "Soft, defined waves after styling", "50% 35%"),
    slot("leaveJar", "A silky leave-in cream texture")
  ]),
  thermal: Object.freeze([
    slot("bottlesPink", "AURELLE Thermal Shield in a haircare arrangement"),
    slot("brushComb", "Styling tools ready for heat styling"),
    slot("longHairBack", "Smooth, long hair after styling", "50% 25%")
  ]),
  wig: Object.freeze([
    slot("wigStand", "AURELLE Signature Straight Wig on a stand", "50% 30%"),
    slot("whiteTop", "A long straight style in soft light", "50% 25%"),
    slot("longHairBack", "Long straight hair seen from behind", "50% 25%")
  ]),
  bundles: Object.freeze([
    slot("wavyHair", "AURELLE Natural Wave Bundles in loose waves", "50% 35%"),
    slot("rosee", "A natural wave pattern in soft light", "50% 30%"),
    slot("wave", "Defined texture in a portrait", "50% 30%")
  ]),
  bonnet: Object.freeze([
    slot("sleepBonnet", "AURELLE Satin Sleep Bonnet folded on a soft surface"),
    slot("silkTexture", "The smooth satin fabric up close"),
    slot("stillFabric", "A satin bonnet in a quiet still life")
  ]),
  brush: Object.freeze([
    slot("brushComb", "AURELLE Signature Hair Brush on a soft surface"),
    slot("stillFabric", "A hair brush beside folded fabric"),
    slot("longHairBack", "Smooth hair after brushing", "50% 25%")
  ])
});

export const imageFallback = (key) => IMG[key] || IMG.hero;
