import type { Prisma } from "@prisma/client";
import { loadLocalEnv } from "./load-local-env";

loadLocalEnv();

type CatalogVariant = {
  oldSku: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  salePrice?: string;
  barcode?: string;
  sizeValue?: string;
  sizeUnit?: string;
  packSize?: number;
};

type CatalogProduct = {
  oldSlug: string;
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  brandSlug: string;
  image: string;
  altText: string;
  origin?: string;
  ingredients?: string;
  storage?: string;
  allergens?: string;
  regionTags: string[];
  dietaryTags?: string[];
  tags?: string[];
  featured?: boolean;
  bestSeller?: boolean;
  weeklyOffer?: boolean;
  variants: CatalogVariant[];
};

const imageBase = "/product-images";

const categories = [
  { name: "Rice and Grains", slug: "rice-and-grains", imageUrl: `${imageBase}/RiceCategory.png`, sortOrder: 10 },
  { name: "Lentils and Beans", slug: "lentils-and-beans", imageUrl: `${imageBase}/LentilsCategory.png`, sortOrder: 20 },
  { name: "Spices and Masalas", slug: "spices-and-masalas", imageUrl: `${imageBase}/SpicesCategory.png`, sortOrder: 30 },
  { name: "Noodles and Sauces", slug: "noodles-and-sauces", imageUrl: `${imageBase}/NoodlesCategory.png`, sortOrder: 40 },
  { name: "Tea and Beverages", slug: "tea-and-beverages", imageUrl: `${imageBase}/HotBeveragesCategory.png`, sortOrder: 50 },
  { name: "Snacks", slug: "snacks", imageUrl: `${imageBase}/SnacksCategory.png`, sortOrder: 60 },
  { name: "Oil and Ghee", slug: "oil-and-ghee", imageUrl: `${imageBase}/OilsandGheeCategory.png`, sortOrder: 70 },
  { name: "Frozen Items", slug: "frozen-items", imageUrl: `${imageBase}/FrozenCategory.png`, sortOrder: 80 },
  { name: "Vegetables", slug: "vegetables", imageUrl: `${imageBase}/VegetablesCategory.png`, sortOrder: 90 },
  { name: "Pickles and Chutneys", slug: "pickles-and-chutneys", imageUrl: `${imageBase}/PicklesCategory.png`, sortOrder: 100 },
];

const brands = [
  { oldSlug: "himalayan-pantry-demo", name: "A1 Pantry Co.", slug: "a1-pantry-co", country: "Nepal" },
  { oldSlug: "bharat-bazaar-demo", name: "Bharat Bazaar Select", slug: "bharat-bazaar-select", country: "India" },
  { oldSlug: "asian-kitchen-demo", name: "Himalayan Kitchen", slug: "himalayan-kitchen", country: "Nepal" },
  { oldSlug: "daily-fresh-demo", name: "A1 Fresh Market", slug: "a1-fresh-market", country: "Australia" },
];

const products: CatalogProduct[] = [
  {
    oldSlug: "demo-premium-basmati-rice",
    name: "A1 Premium Basmati Rice",
    slug: "a1-premium-basmati-rice",
    description: "Aromatic long-grain basmati rice selected for biryani, pulao, fried rice, and everyday family meals. The grains cook fluffy and separate with a naturally fragrant finish.",
    categorySlug: "rice-and-grains",
    brandSlug: "bharat-bazaar-select",
    image: "a1-premium-basmati-rice.webp",
    altText: "A1 Premium Basmati Rice bag",
    origin: "India",
    regionTags: ["Indian", "Asian"],
    dietaryTags: ["Vegetarian", "Vegan"],
    tags: ["rice", "basmati", "pantry"],
    featured: true,
    bestSeller: true,
    variants: [
      { oldSku: "DEMO-RICE-BAS-1KG", name: "1kg bag", sku: "A1-RICE-BAS-1KG", barcode: "9901000000011", sizeValue: "1", sizeUnit: "kg", packSize: 1, price: "5.99", stock: 64 },
      { oldSku: "DEMO-RICE-BAS-5KG", name: "5kg bag", sku: "A1-RICE-BAS-5KG", barcode: "9901000000012", sizeValue: "5", sizeUnit: "kg", packSize: 1, price: "24.99", salePrice: "22.99", stock: 32 },
      { oldSku: "DEMO-RICE-BAS-10KG", name: "10kg bag", sku: "A1-RICE-BAS-10KG", barcode: "9901000000013", sizeValue: "10", sizeUnit: "kg", packSize: 1, price: "44.99", stock: 18 },
    ],
  },
  {
    oldSlug: "demo-sona-masoori-rice",
    name: "A1 Sona Masoori Rice",
    slug: "a1-sona-masoori-rice",
    description: "Light, medium-grain sona masoori rice for steamed rice, lemon rice, curd rice, dosa batter, and everyday South Asian cooking.",
    categorySlug: "rice-and-grains",
    brandSlug: "bharat-bazaar-select",
    image: "a1-sona-masoori-rice.webp",
    altText: "A1 Sona Masoori Rice bag",
    origin: "India",
    regionTags: ["Indian", "Asian"],
    dietaryTags: ["Vegetarian", "Vegan"],
    tags: ["rice", "sona masoori"],
    weeklyOffer: true,
    variants: [
      { oldSku: "DEMO-RICE-SONA-1KG", name: "1kg bag", sku: "A1-RICE-SONA-1KG", barcode: "9901000000021", sizeValue: "1", sizeUnit: "kg", packSize: 1, price: "4.99", stock: 48 },
      { oldSku: "DEMO-RICE-SONA-5KG", name: "5kg bag", sku: "A1-RICE-SONA-5KG", barcode: "9901000000022", sizeValue: "5", sizeUnit: "kg", packSize: 1, price: "21.99", salePrice: "19.99", stock: 30 },
      { oldSku: "DEMO-RICE-SONA-10KG", name: "10kg bag", sku: "A1-RICE-SONA-10KG", barcode: "9901000000023", sizeValue: "10", sizeUnit: "kg", packSize: 1, price: "39.99", stock: 15 },
    ],
  },
  {
    oldSlug: "demo-red-lentils-masoor-dal",
    name: "A1 Masoor Dal Red Lentils",
    slug: "a1-masoor-dal-red-lentils",
    description: "Split red lentils that cook quickly into smooth dal, soups, stews, and curry bases. A reliable pantry staple for weeknight meals.",
    categorySlug: "lentils-and-beans",
    brandSlug: "a1-pantry-co",
    image: "a1-masoor-dal.webp",
    altText: "A1 Masoor Dal Red Lentils pack",
    origin: "Nepal",
    regionTags: ["Nepali", "Indian"],
    dietaryTags: ["Vegetarian", "Vegan"],
    tags: ["dal", "lentils"],
    bestSeller: true,
    variants: [
      { oldSku: "DEMO-DAL-MASOOR-1KG", name: "1kg pack", sku: "A1-DAL-MASOOR-1KG", barcode: "9901000000031", sizeValue: "1", sizeUnit: "kg", packSize: 1, price: "4.49", stock: 82 },
      { oldSku: "DEMO-DAL-MASOOR-5KG", name: "5kg pack", sku: "A1-DAL-MASOOR-5KG", barcode: "9901000000032", sizeValue: "5", sizeUnit: "kg", packSize: 1, price: "19.99", stock: 25 },
      { oldSku: "DEMO-DAL-MASOOR-10KG", name: "10kg sack", sku: "A1-DAL-MASOOR-10KG", barcode: "9901000000033", sizeValue: "10", sizeUnit: "kg", packSize: 1, price: "37.99", salePrice: "34.99", stock: 9 },
    ],
  },
  {
    oldSlug: "demo-mixed-dal-combo",
    name: "A1 Mixed Dal Combo",
    slug: "a1-mixed-dal-combo",
    description: "A balanced blend of popular lentils for dal, khichdi, soups, and slow-cooked curries. Handy when you want depth without opening multiple bags.",
    categorySlug: "lentils-and-beans",
    brandSlug: "a1-pantry-co",
    image: "a1-mixed-dal-combo.webp",
    altText: "A1 Mixed Dal Combo pack",
    origin: "Nepal",
    regionTags: ["Nepali", "Indian"],
    dietaryTags: ["Vegetarian", "Vegan"],
    tags: ["dal", "lentils", "combo"],
    variants: [
      { oldSku: "DEMO-DAL-MIX-1KG", name: "1kg pack", sku: "A1-DAL-MIX-1KG", barcode: "9901000000041", sizeValue: "1", sizeUnit: "kg", packSize: 1, price: "5.49", stock: 40 },
      { oldSku: "DEMO-DAL-MIX-5KG", name: "5kg pack", sku: "A1-DAL-MIX-5KG", barcode: "9901000000042", sizeValue: "5", sizeUnit: "kg", packSize: 1, price: "24.49", stock: 14 },
    ],
  },
  {
    oldSlug: "demo-garam-masala-blend",
    name: "Bharat Bazaar Garam Masala",
    slug: "bharat-bazaar-garam-masala",
    description: "A warm finishing spice blend for curries, marinades, roasted vegetables, and lentil dishes. Adds aromatic depth near the end of cooking.",
    categorySlug: "spices-and-masalas",
    brandSlug: "bharat-bazaar-select",
    image: "a1-garam-masala.webp",
    altText: "Bharat Bazaar Garam Masala pack",
    ingredients: "Coriander, cumin, cardamom, cinnamon, cloves, black pepper.",
    origin: "India",
    regionTags: ["Indian", "Nepali"],
    dietaryTags: ["Vegetarian", "Vegan"],
    tags: ["spice", "masala"],
    featured: true,
    variants: [
      { oldSku: "DEMO-SPICE-GARAM-100G", name: "100g pouch", sku: "BB-SPICE-GARAM-100G", barcode: "9901000000051", sizeValue: "100", sizeUnit: "g", packSize: 1, price: "3.49", stock: 95 },
      { oldSku: "DEMO-SPICE-GARAM-5PK", name: "5 x 100g carton", sku: "BB-SPICE-GARAM-5PK", barcode: "9901000000052", sizeValue: "100", sizeUnit: "g", packSize: 5, price: "15.99", salePrice: "14.49", stock: 28 },
      { oldSku: "DEMO-SPICE-GARAM-30PK", name: "30 x 100g carton", sku: "BB-SPICE-GARAM-30PK", barcode: "9901000000053", sizeValue: "100", sizeUnit: "g", packSize: 30, price: "84.99", stock: 6 },
    ],
  },
  {
    oldSlug: "demo-turmeric-powder",
    name: "Bharat Bazaar Turmeric Powder",
    slug: "bharat-bazaar-turmeric-powder",
    description: "Bright haldi powder for curries, pickles, marinades, rice dishes, and golden milk. Fine ground for smooth blending.",
    categorySlug: "spices-and-masalas",
    brandSlug: "bharat-bazaar-select",
    image: "a1-turmeric-powder.webp",
    altText: "Bharat Bazaar Turmeric Powder pack",
    origin: "India",
    regionTags: ["Indian", "Asian"],
    dietaryTags: ["Vegetarian", "Vegan"],
    tags: ["spice", "haldi", "turmeric"],
    weeklyOffer: true,
    variants: [
      { oldSku: "DEMO-SPICE-TURMERIC-200G", name: "200g pouch", sku: "BB-SPICE-TURMERIC-200G", barcode: "9901000000061", sizeValue: "200", sizeUnit: "g", packSize: 1, price: "3.99", stock: 55 },
      { oldSku: "DEMO-SPICE-TURMERIC-1KG", name: "1kg pouch", sku: "BB-SPICE-TURMERIC-1KG", barcode: "9901000000062", sizeValue: "1", sizeUnit: "kg", packSize: 1, price: "13.99", salePrice: "12.49", stock: 18 },
    ],
  },
  {
    oldSlug: "demo-instant-masala-noodles",
    name: "Himalayan Kitchen Masala Noodles",
    slug: "himalayan-kitchen-masala-noodles",
    description: "Quick masala instant noodles with a savoury spice profile. Great as a snack, quick lunch, or momo-night side.",
    categorySlug: "noodles-and-sauces",
    brandSlug: "himalayan-kitchen",
    image: "a1-instant-masala-noodles.webp",
    altText: "Himalayan Kitchen Masala Noodles pack",
    allergens: "Contains wheat and soy.",
    regionTags: ["Nepali", "Indian", "Asian"],
    tags: ["noodles", "snack"],
    bestSeller: true,
    weeklyOffer: true,
    variants: [
      { oldSku: "DEMO-NOOD-MASALA-1PK", name: "Single pack", sku: "HK-NOOD-MASALA-1PK", barcode: "9901000000071", packSize: 1, price: "1.29", stock: 180 },
      { oldSku: "DEMO-NOOD-MASALA-5PK", name: "5 pack", sku: "HK-NOOD-MASALA-5PK", barcode: "9901000000072", packSize: 5, price: "5.99", stock: 62 },
      { oldSku: "DEMO-NOOD-MASALA-30PK", name: "30 pack carton", sku: "HK-NOOD-MASALA-30PK", barcode: "9901000000073", packSize: 30, price: "32.99", salePrice: "29.99", stock: 12 },
    ],
  },
  {
    oldSlug: "demo-wai-wai-chicken-noodles",
    name: "Himalayan Kitchen Chicken Style Noodles",
    slug: "himalayan-kitchen-chicken-style-noodles",
    description: "Chicken-style instant noodles with a classic South Asian snack profile. Serve dry and crunchy or cook into a quick noodle bowl.",
    categorySlug: "noodles-and-sauces",
    brandSlug: "himalayan-kitchen",
    image: "a1-chicken-style-noodles.webp",
    altText: "Himalayan Kitchen Chicken Style Noodles pack",
    allergens: "Contains wheat and soy.",
    regionTags: ["Nepali", "Asian"],
    tags: ["noodles", "snack"],
    variants: [
      { oldSku: "DEMO-NOOD-WAIWAI-1PK", name: "Single pack", sku: "HK-NOOD-CHICKEN-1PK", barcode: "9901000000081", packSize: 1, price: "1.49", stock: 120 },
      { oldSku: "DEMO-NOOD-WAIWAI-5PK", name: "5 pack", sku: "HK-NOOD-CHICKEN-5PK", barcode: "9901000000082", packSize: 5, price: "6.49", stock: 44 },
      { oldSku: "DEMO-NOOD-WAIWAI-30PK", name: "30 pack carton", sku: "HK-NOOD-CHICKEN-30PK", barcode: "9901000000083", packSize: 30, price: "35.99", stock: 8 },
    ],
  },
  {
    oldSlug: "demo-nepali-black-tea",
    name: "A1 Nepali Black Tea",
    slug: "a1-nepali-black-tea",
    description: "Rich black tea leaves for milk tea, masala chiya, and everyday brewing. Strong enough for spices and milk, smooth enough to drink plain.",
    categorySlug: "tea-and-beverages",
    brandSlug: "a1-pantry-co",
    image: "a1-nepali-black-tea.webp",
    altText: "A1 Nepali Black Tea pack",
    origin: "Nepal",
    regionTags: ["Nepali", "Asian"],
    dietaryTags: ["Vegetarian", "Vegan"],
    tags: ["tea", "chiya"],
    featured: true,
    variants: [
      { oldSku: "DEMO-TEA-NP-BLACK-250G", name: "250g pack", sku: "A1-TEA-BLACK-250G", barcode: "9901000000091", sizeValue: "250", sizeUnit: "g", packSize: 1, price: "6.49", stock: 48 },
      { oldSku: "DEMO-TEA-NP-BLACK-1KG", name: "1kg pack", sku: "A1-TEA-BLACK-1KG", barcode: "9901000000092", sizeValue: "1", sizeUnit: "kg", packSize: 1, price: "21.99", stock: 15 },
    ],
  },
  {
    oldSlug: "demo-spicy-crunch-mix",
    name: "Bharat Bazaar Spicy Crunch Mix",
    slug: "bharat-bazaar-spicy-crunch-mix",
    description: "Crunchy savoury snack mix with peanuts, lentil noodles, and spices. Serve with tea, add to chaat, or keep on hand for quick snacks.",
    categorySlug: "snacks",
    brandSlug: "bharat-bazaar-select",
    image: "a1-spicy-crunch-mix.webp",
    altText: "Bharat Bazaar Spicy Crunch Mix pack",
    allergens: "Contains peanuts.",
    regionTags: ["Indian", "Asian"],
    tags: ["snack", "namkeen"],
    variants: [
      { oldSku: "DEMO-SNACK-CRUNCH-200G", name: "200g pouch", sku: "BB-SNACK-CRUNCH-200G", barcode: "9901000000101", sizeValue: "200", sizeUnit: "g", packSize: 1, price: "3.99", stock: 60 },
      { oldSku: "DEMO-SNACK-CRUNCH-5PK", name: "5 x 200g carton", sku: "BB-SNACK-CRUNCH-5PK", barcode: "9901000000102", sizeValue: "200", sizeUnit: "g", packSize: 5, price: "18.49", salePrice: "16.99", stock: 20 },
    ],
  },
  {
    oldSlug: "demo-mustard-cooking-oil",
    name: "A1 Mustard Cooking Oil",
    slug: "a1-mustard-cooking-oil",
    description: "Strong aromatic mustard oil for Nepali and Indian cooking, pickles, stir fries, marinades, and traditional recipes.",
    categorySlug: "oil-and-ghee",
    brandSlug: "a1-pantry-co",
    image: "a1-mustard-cooking-oil.webp",
    altText: "A1 Mustard Cooking Oil bottle",
    origin: "India",
    regionTags: ["Nepali", "Indian"],
    tags: ["oil", "mustard"],
    weeklyOffer: true,
    variants: [
      { oldSku: "DEMO-OIL-MUSTARD-1L", name: "1L bottle", sku: "A1-OIL-MUSTARD-1L", barcode: "9901000000111", sizeValue: "1", sizeUnit: "L", packSize: 1, price: "7.99", stock: 40 },
      { oldSku: "DEMO-OIL-MUSTARD-2L", name: "2L bottle", sku: "A1-OIL-MUSTARD-2L", barcode: "9901000000112", sizeValue: "2", sizeUnit: "L", packSize: 1, price: "14.99", salePrice: "13.49", stock: 22 },
      { oldSku: "DEMO-OIL-MUSTARD-5L", name: "5L tin", sku: "A1-OIL-MUSTARD-5L", barcode: "9901000000113", sizeValue: "5", sizeUnit: "L", packSize: 1, price: "34.99", stock: 10 },
    ],
  },
  {
    oldSlug: "demo-frozen-vegetable-momos",
    name: "A1 Frozen Vegetable Momos",
    slug: "a1-frozen-vegetable-momos",
    description: "Frozen vegetable dumplings ready to steam, pan fry, or add to soup. Keep a pack ready for quick snacks and momo nights.",
    categorySlug: "frozen-items",
    brandSlug: "a1-pantry-co",
    image: "a1-frozen-vegetable-momos.webp",
    altText: "A1 Frozen Vegetable Momos pack",
    storage: "Keep frozen at -18C.",
    allergens: "Contains wheat and soy.",
    regionTags: ["Nepali", "Asian"],
    dietaryTags: ["Vegetarian"],
    tags: ["momos", "frozen"],
    featured: true,
    variants: [
      { oldSku: "DEMO-FRZ-MOMO-VEG-500G", name: "500g pack", sku: "A1-FRZ-MOMO-VEG-500G", barcode: "9901000000121", sizeValue: "500", sizeUnit: "g", packSize: 1, price: "8.99", stock: 34 },
      { oldSku: "DEMO-FRZ-MOMO-VEG-5PK", name: "5 x 500g carton", sku: "A1-FRZ-MOMO-VEG-5PK", barcode: "9901000000122", sizeValue: "500", sizeUnit: "g", packSize: 5, price: "41.99", stock: 9 },
    ],
  },
  {
    oldSlug: "demo-fresh-okra",
    name: "Fresh Okra Bhindi",
    slug: "fresh-okra-bhindi",
    description: "Fresh okra selected for bhindi masala, curries, stir fries, and everyday vegetable sides. Best cooked soon after purchase.",
    categorySlug: "vegetables",
    brandSlug: "a1-fresh-market",
    image: "a1-fresh-okra.webp",
    altText: "Fresh Okra Bhindi pack",
    storage: "Refrigerate and use within 3 days.",
    regionTags: ["Indian", "Asian", "General"],
    dietaryTags: ["Vegetarian", "Vegan"],
    tags: ["vegetables", "okra", "bhindi"],
    variants: [
      { oldSku: "DEMO-VEG-OKRA-500G", name: "500g bag", sku: "A1-VEG-OKRA-500G", barcode: "9901000000131", sizeValue: "500", sizeUnit: "g", packSize: 1, price: "4.99", stock: 26 },
      { oldSku: "DEMO-VEG-OKRA-1KG", name: "1kg bag", sku: "A1-VEG-OKRA-1KG", barcode: "9901000000132", sizeValue: "1", sizeUnit: "kg", packSize: 1, price: "8.99", stock: 14 },
    ],
  },
  {
    oldSlug: "fresh-cauliflower",
    name: "Fresh Cauliflower",
    slug: "fresh-cauliflower",
    description: "Fresh cauliflower head for aloo gobi, curries, roasted vegetable trays, soups, and everyday family meals.",
    categorySlug: "vegetables",
    brandSlug: "a1-fresh-market",
    image: "a1-fresh-cauliflower.webp",
    altText: "Fresh Cauliflower",
    storage: "Refrigerate and use within 4 days.",
    regionTags: ["Indian", "Asian", "General"],
    dietaryTags: ["Vegetarian", "Vegan"],
    tags: ["vegetables", "cauliflower", "fresh"],
    variants: [
      { oldSku: "A1-VEG-CAULIFLOWER-EA", name: "Each", sku: "A1-VEG-CAULIFLOWER-EA", barcode: "9901000000151", packSize: 1, price: "5.49", stock: 18 },
    ],
  },
  {
    oldSlug: "fresh-coriander-bunch",
    name: "Fresh Coriander Bunch",
    slug: "fresh-coriander-bunch",
    description: "Fragrant coriander bunch for chutney, garnish, momo achar, curries, dal, and fresh salad bowls.",
    categorySlug: "vegetables",
    brandSlug: "a1-fresh-market",
    image: "a1-fresh-coriander.webp",
    altText: "Fresh Coriander Bunch",
    storage: "Keep refrigerated. Rinse before use.",
    regionTags: ["Nepali", "Indian", "Asian"],
    dietaryTags: ["Vegetarian", "Vegan"],
    tags: ["vegetables", "coriander", "herbs"],
    variants: [
      { oldSku: "A1-VEG-CORIANDER-BUNCH", name: "1 bunch", sku: "A1-VEG-CORIANDER-BUNCH", barcode: "9901000000152", packSize: 1, price: "2.49", stock: 32 },
    ],
  },
  {
    oldSlug: "green-chillies",
    name: "Green Chillies",
    slug: "green-chillies",
    description: "Fresh green chillies for achar, curries, stir fries, marinades, and adding clean heat to everyday cooking.",
    categorySlug: "vegetables",
    brandSlug: "a1-fresh-market",
    image: "a1-green-chillies.webp",
    altText: "Green Chillies",
    storage: "Refrigerate in a dry container and use within 5 days.",
    regionTags: ["Nepali", "Indian", "Asian"],
    dietaryTags: ["Vegetarian", "Vegan"],
    tags: ["vegetables", "chilli", "fresh"],
    variants: [
      { oldSku: "A1-VEG-GREEN-CHILLI-250G", name: "250g pack", sku: "A1-VEG-GREEN-CHILLI-250G", barcode: "9901000000153", sizeValue: "250", sizeUnit: "g", packSize: 1, price: "3.49", stock: 24 },
    ],
  },
  {
    oldSlug: "demo-mango-pickle",
    name: "Bharat Bazaar Mango Pickle",
    slug: "bharat-bazaar-mango-pickle",
    description: "Tangy mango pickle for dal bhat, paratha, rice bowls, and snack plates. A small spoonful adds heat, oil, and sour mango punch.",
    categorySlug: "pickles-and-chutneys",
    brandSlug: "bharat-bazaar-select",
    image: "a1-mango-pickle.webp",
    altText: "Bharat Bazaar Mango Pickle jar",
    storage: "Store in a cool dry place. Refrigerate after opening.",
    regionTags: ["Nepali", "Indian"],
    dietaryTags: ["Vegetarian", "Vegan"],
    tags: ["pickle", "achar", "mango"],
    variants: [
      { oldSku: "DEMO-PICKLE-MANGO-400G", name: "400g jar", sku: "BB-PICKLE-MANGO-400G", barcode: "9901000000141", sizeValue: "400", sizeUnit: "g", packSize: 1, price: "5.99", stock: 38 },
      { oldSku: "DEMO-PICKLE-MANGO-1KG", name: "1kg jar", sku: "BB-PICKLE-MANGO-1KG", barcode: "9901000000142", sizeValue: "1", sizeUnit: "kg", packSize: 1, price: "12.99", salePrice: "11.49", stock: 11 },
    ],
  },
  {
    oldSlug: "rice-and-lentils",
    name: "A1 Rice & Lentils Starter Pack",
    slug: "a1-rice-lentils-starter-pack",
    description: "A practical pantry starter pack with rice and lentils for dal bhat, khichdi, soups, and quick weekday meals.",
    categorySlug: "rice-and-grains",
    brandSlug: "a1-pantry-co",
    image: "a1-rice-lentils-starter-pack.webp",
    altText: "A1 Rice and Lentils Starter Pack",
    origin: "Nepal",
    regionTags: ["Nepali", "Indian"],
    dietaryTags: ["Vegetarian", "Vegan"],
    tags: ["rice", "lentils", "combo"],
    variants: [
      { oldSku: "RICE-5KG", name: "1kg starter pack", sku: "A1-COMBO-RICE-LENTIL-1KG", sizeValue: "1", sizeUnit: "kg", packSize: 1, price: "6.99", stock: 24 },
    ],
  },
];

function imageUrl(file: string) {
  return `${imageBase}/${file}`;
}

async function upsertBrand(
  prisma: Awaited<typeof import("../src/lib/prisma")>["prisma"],
  brand: (typeof brands)[number],
) {
  const existing = await prisma.brand.findFirst({
    where: { OR: [{ slug: brand.slug }, { slug: brand.oldSlug }] },
  });

  if (existing) {
    return prisma.brand.update({
      where: { id: existing.id },
      data: { name: brand.name, slug: brand.slug, country: brand.country },
    });
  }

  return prisma.brand.create({
    data: { name: brand.name, slug: brand.slug, country: brand.country },
  });
}

async function refreshRealCatalog() {
  const { prisma } = await import("../src/lib/prisma");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        imageUrl: category.imageUrl,
        sortOrder: category.sortOrder,
        isFeatured: true,
      },
      create: {
        ...category,
        isFeatured: true,
      },
    });
  }

  for (const brand of brands) {
    await upsertBrand(prisma, brand);
  }

  const categoryBySlug = new Map((await prisma.category.findMany()).map((category) => [category.slug, category]));
  const brandBySlug = new Map((await prisma.brand.findMany()).map((brand) => [brand.slug, brand]));

  for (const product of products) {
    const category = categoryBySlug.get(product.categorySlug);
    const brand = brandBySlug.get(product.brandSlug);

    if (!category || !brand) {
      throw new Error(`Missing category or brand for ${product.slug}`);
    }

    const existingProduct = await prisma.product.findFirst({
      where: { OR: [{ slug: product.slug }, { slug: product.oldSlug }] },
    });

    const productData = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      ingredients: product.ingredients ?? null,
      storage: product.storage ?? null,
      origin: product.origin ?? null,
      allergens: product.allergens ?? null,
      regionTags: product.regionTags,
      dietaryTags: product.dietaryTags ?? [],
      tags: product.tags ?? [],
      status: "ACTIVE",
      isFeatured: product.featured ?? false,
      isBestSeller: product.bestSeller ?? false,
      isWeeklyOffer: product.weeklyOffer ?? false,
      categoryId: category.id,
      brandId: brand.id,
    } satisfies Prisma.ProductUncheckedUpdateInput;

    const productRecord = existingProduct
      ? await prisma.product.update({
          where: { id: existingProduct.id },
          data: productData,
        })
      : await prisma.product.create({
          data: productData as Prisma.ProductUncheckedCreateInput,
        });

    await prisma.productImage.deleteMany({ where: { productId: productRecord.id } });
    await prisma.productImage.create({
      data: {
        productId: productRecord.id,
        url: imageUrl(product.image),
        storagePath: `product-images/${product.image}`,
        altText: product.altText,
        format: "WEBP",
        sizeBytes: 180000,
        width: 1200,
        height: 1200,
        sortOrder: 0,
        isPrimary: true,
      },
    });

    const desiredVariantIds: string[] = [];

    for (const variant of product.variants) {
      const variantData = {
        productId: productRecord.id,
        name: variant.name,
        sku: variant.sku,
        barcode: variant.barcode ?? null,
        sizeValue: variant.sizeValue ?? null,
        sizeUnit: variant.sizeUnit ?? null,
        packSize: variant.packSize ?? null,
        price: variant.price,
        salePrice: variant.salePrice ?? null,
        stock: variant.stock,
        lowStockThreshold: 5,
        imageUrl: imageUrl(product.image),
        status: "ACTIVE",
      } satisfies Prisma.ProductVariantUncheckedCreateInput;

      const existingVariant = await prisma.productVariant.findFirst({
        where: {
          OR: [{ sku: variant.sku }, { sku: variant.oldSku }],
        },
      });

      const savedVariant = existingVariant
        ? await prisma.productVariant.update({
            where: { id: existingVariant.id },
            data: variantData,
          })
        : await prisma.productVariant.create({ data: variantData });

      desiredVariantIds.push(savedVariant.id);
    }

    await prisma.productVariant.deleteMany({
      where: {
        productId: productRecord.id,
        id: { notIn: desiredVariantIds },
      },
    });
  }

  console.log(`Real catalog ready: ${categories.length} categories, ${brands.length} brands, ${products.length} products.`);
  await prisma.$disconnect();
}

refreshRealCatalog().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
