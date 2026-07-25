import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type SeedVariant = {
  name: string;
  sku: string;
  barcode?: string;
  sizeValue?: string;
  sizeUnit?: string;
  packSize?: number;
  price: string;
  salePrice?: string;
  stock: number;
  lowStockThreshold?: number;
  imageUrl?: string;
};

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  brandSlug: string;
  ingredients?: string;
  storage?: string;
  origin?: string;
  allergens?: string;
  regionTags: string[];
  dietaryTags?: string[];
  isFeatured?: boolean;
  image: {
    url: string;
    storagePath: string;
    altText: string;
  };
  variants: SeedVariant[];
};

const imageBase = "/product-images";

const categories = [
  { name: "Rice and Grains", slug: "rice-and-grains", imageUrl: `${imageBase}/RiceCategory.png`, sortOrder: 10, isFeatured: true },
  { name: "Lentils and Beans", slug: "lentils-and-beans", imageUrl: `${imageBase}/LentilsCategory.png`, sortOrder: 20, isFeatured: true },
  { name: "Spices and Masalas", slug: "spices-and-masalas", imageUrl: `${imageBase}/SpicesCategory.png`, sortOrder: 30, isFeatured: true },
  { name: "Noodles and Sauces", slug: "noodles-and-sauces", imageUrl: `${imageBase}/NoodlesCategory.png`, sortOrder: 40, isFeatured: true },
  { name: "Tea and Beverages", slug: "tea-and-beverages", imageUrl: `${imageBase}/HotBeveragesCategory.png`, sortOrder: 50, isFeatured: true },
  { name: "Snacks", slug: "snacks", imageUrl: `${imageBase}/SnacksCategory.png`, sortOrder: 60, isFeatured: true },
  { name: "Oil and Ghee", slug: "oil-and-ghee", imageUrl: `${imageBase}/OilsandGheeCategory.png`, sortOrder: 70, isFeatured: true },
  { name: "Frozen Items", slug: "frozen-items", imageUrl: `${imageBase}/FrozenCategory.png`, sortOrder: 80, isFeatured: true },
  { name: "Vegetables", slug: "vegetables", imageUrl: `${imageBase}/VegetablesCategory.png`, sortOrder: 90, isFeatured: true },
  { name: "Pickles and Chutneys", slug: "pickles-and-chutneys", imageUrl: `${imageBase}/PicklesCategory.png`, sortOrder: 100, isFeatured: true },
];

const brands = [
  { name: "Himalayan Pantry", slug: "himalayan-pantry", country: "Nepal" },
  { name: "Everest Choice", slug: "everest-choice", country: "Nepal" },
  { name: "Bharat Bazaar", slug: "bharat-bazaar", country: "India" },
  { name: "Asian Kitchen Co", slug: "asian-kitchen-co", country: "Thailand" },
  { name: "Daily Fresh", slug: "daily-fresh", country: "Australia" },
];

const products: SeedProduct[] = [
  {
    name: "Premium Basmati Rice",
    slug: "premium-basmati-rice",
    description: "Long grain aromatic basmati rice for biryani, pulao, and everyday meals.",
    categorySlug: "rice-and-grains",
    brandSlug: "Bharat Bazaar".toLowerCase().replaceAll(" ", "-"),
    origin: "India",
    regionTags: ["Indian", "Asian"],
    dietaryTags: ["Vegetarian", "Vegan"],
    isFeatured: true,
    image: {
      url: "https://example.supabase.co/storage/v1/object/public/product-images/rice/basmati-rice.webp",
      storagePath: "rice/basmati-rice.webp",
      altText: "Bag of premium basmati rice",
    },
    variants: [
      { name: "1kg bag", sku: "RICE-BAS-1KG", barcode: "9300000000011", sizeValue: "1", sizeUnit: "kg", packSize: 1, price: "5.99", stock: 60 },
      { name: "5kg bag", sku: "RICE-BAS-5KG", barcode: "9300000000012", sizeValue: "5", sizeUnit: "kg", packSize: 1, price: "24.99", salePrice: "22.99", stock: 35 },
      { name: "10kg bag", sku: "RICE-BAS-10KG", barcode: "9300000000013", sizeValue: "10", sizeUnit: "kg", packSize: 1, price: "44.99", stock: 20, lowStockThreshold: 4 },
    ],
  },
  {
    name: "Red Lentils Masoor Dal",
    slug: "red-lentils-masoor-dal",
    description: "Split red lentils that cook quickly for dal, soup, and curries.",
    categorySlug: "lentils-and-beans",
    brandSlug: "himalayan-pantry",
    origin: "Nepal",
    regionTags: ["Nepali", "Indian"],
    dietaryTags: ["Vegetarian", "Vegan"],
    image: {
      url: "https://example.supabase.co/storage/v1/object/public/product-images/lentils/masoor-dal.webp",
      storagePath: "lentils/masoor-dal.webp",
      altText: "Red lentils masoor dal",
    },
    variants: [
      { name: "1kg pack", sku: "DAL-MASOOR-1KG", barcode: "9300000000021", sizeValue: "1", sizeUnit: "kg", packSize: 1, price: "4.49", stock: 80 },
      { name: "5kg pack", sku: "DAL-MASOOR-5KG", barcode: "9300000000022", sizeValue: "5", sizeUnit: "kg", packSize: 1, price: "19.99", stock: 28 },
      { name: "10kg sack", sku: "DAL-MASOOR-10KG", barcode: "9300000000023", sizeValue: "10", sizeUnit: "kg", packSize: 1, price: "37.99", salePrice: "34.99", stock: 12 },
    ],
  },
  {
    name: "Garam Masala Blend",
    slug: "garam-masala-blend",
    description: "Warm spice blend for curries, marinades, and finishing dishes.",
    categorySlug: "spices-and-masalas",
    brandSlug: "everest-choice",
    ingredients: "Coriander, cumin, cardamom, cinnamon, cloves, black pepper.",
    origin: "India",
    regionTags: ["Indian", "Nepali"],
    dietaryTags: ["Vegetarian", "Vegan"],
    isFeatured: true,
    image: {
      url: "https://example.supabase.co/storage/v1/object/public/product-images/spices/garam-masala.webp",
      storagePath: "spices/garam-masala.webp",
      altText: "Packet of garam masala spice blend",
    },
    variants: [
      { name: "Single pack 100g", sku: "SPICE-GARAM-100G", barcode: "9300000000031", sizeValue: "100", sizeUnit: "g", packSize: 1, price: "3.49", stock: 100 },
      { name: "5 pack 100g", sku: "SPICE-GARAM-5PK", barcode: "9300000000032", sizeValue: "100", sizeUnit: "g", packSize: 5, price: "15.99", salePrice: "14.49", stock: 30 },
      { name: "30 pack carton", sku: "SPICE-GARAM-30PK", barcode: "9300000000033", sizeValue: "100", sizeUnit: "g", packSize: 30, price: "84.99", stock: 8, lowStockThreshold: 2 },
    ],
  },
  {
    name: "Instant Masala Noodles",
    slug: "instant-masala-noodles",
    description: "Quick masala noodles for a spicy snack or light meal.",
    categorySlug: "noodles-and-sauces",
    brandSlug: "asian-kitchen-co",
    allergens: "Contains wheat and soy.",
    regionTags: ["Nepali", "Indian", "Asian"],
    image: {
      url: "https://example.supabase.co/storage/v1/object/public/product-images/noodles/masala-noodles.webp",
      storagePath: "noodles/masala-noodles.webp",
      altText: "Packet of instant masala noodles",
    },
    variants: [
      { name: "Single pack", sku: "NOOD-MASALA-1PK", barcode: "9300000000041", packSize: 1, price: "1.29", stock: 200 },
      { name: "5 pack", sku: "NOOD-MASALA-5PK", barcode: "9300000000042", packSize: 5, price: "5.99", stock: 70 },
      { name: "30 pack carton", sku: "NOOD-MASALA-30PK", barcode: "9300000000043", packSize: 30, price: "32.99", salePrice: "29.99", stock: 16 },
    ],
  },
  {
    name: "Nepali Black Tea",
    slug: "nepali-black-tea",
    description: "Rich black tea leaves for milk tea, masala chiya, and everyday brewing.",
    categorySlug: "tea-and-beverages",
    brandSlug: "himalayan-pantry",
    origin: "Nepal",
    regionTags: ["Nepali", "Asian"],
    dietaryTags: ["Vegetarian", "Vegan"],
    image: {
      url: "https://example.supabase.co/storage/v1/object/public/product-images/tea/nepali-black-tea.webp",
      storagePath: "tea/nepali-black-tea.webp",
      altText: "Nepali black tea packet",
    },
    variants: [
      { name: "250g pack", sku: "TEA-NP-BLACK-250G", barcode: "9300000000051", sizeValue: "250", sizeUnit: "g", packSize: 1, price: "6.49", stock: 48 },
      { name: "1kg pack", sku: "TEA-NP-BLACK-1KG", barcode: "9300000000052", sizeValue: "1", sizeUnit: "kg", packSize: 1, price: "21.99", stock: 18 },
    ],
  },
  {
    name: "Spicy Crunch Mix",
    slug: "spicy-crunch-mix",
    description: "Crunchy savoury snack mix with peanuts, lentil noodles, and spices.",
    categorySlug: "snacks",
    brandSlug: "bharat-bazaar",
    allergens: "Contains peanuts.",
    regionTags: ["Indian", "Asian"],
    image: {
      url: "https://example.supabase.co/storage/v1/object/public/product-images/snacks/spicy-crunch-mix.webp",
      storagePath: "snacks/spicy-crunch-mix.webp",
      altText: "Spicy crunchy snack mix",
    },
    variants: [
      { name: "Single pack 200g", sku: "SNACK-CRUNCH-200G", barcode: "9300000000061", sizeValue: "200", sizeUnit: "g", packSize: 1, price: "3.99", stock: 65 },
      { name: "5 pack 200g", sku: "SNACK-CRUNCH-5PK", barcode: "9300000000062", sizeValue: "200", sizeUnit: "g", packSize: 5, price: "18.49", stock: 25 },
    ],
  },
  {
    name: "Mustard Cooking Oil",
    slug: "mustard-cooking-oil",
    description: "Strong aromatic mustard oil for traditional Nepali and Indian cooking.",
    categorySlug: "oil-and-ghee",
    brandSlug: "everest-choice",
    origin: "India",
    regionTags: ["Nepali", "Indian"],
    image: {
      url: "https://example.supabase.co/storage/v1/object/public/product-images/oil/mustard-oil.webp",
      storagePath: "oil/mustard-oil.webp",
      altText: "Bottle of mustard cooking oil",
    },
    variants: [
      { name: "1L bottle", sku: "OIL-MUSTARD-1L", barcode: "9300000000071", sizeValue: "1", sizeUnit: "L", packSize: 1, price: "7.99", stock: 42 },
      { name: "2L bottle", sku: "OIL-MUSTARD-2L", barcode: "9300000000072", sizeValue: "2", sizeUnit: "L", packSize: 1, price: "14.99", salePrice: "13.49", stock: 22 },
      { name: "5L tin", sku: "OIL-MUSTARD-5L", barcode: "9300000000073", sizeValue: "5", sizeUnit: "L", packSize: 1, price: "34.99", stock: 10, lowStockThreshold: 3 },
    ],
  },
  {
    name: "Frozen Vegetable Momos",
    slug: "frozen-vegetable-momos",
    description: "Frozen vegetable dumplings ready to steam, pan fry, or add to soup.",
    categorySlug: "frozen-items",
    brandSlug: "himalayan-pantry",
    allergens: "Contains wheat and soy.",
    storage: "Keep frozen at -18C.",
    regionTags: ["Nepali", "Asian"],
    dietaryTags: ["Vegetarian"],
    isFeatured: true,
    image: {
      url: "https://example.supabase.co/storage/v1/object/public/product-images/frozen/veg-momos.webp",
      storagePath: "frozen/veg-momos.webp",
      altText: "Frozen vegetable momos pack",
    },
    variants: [
      { name: "Single pack 500g", sku: "FRZ-MOMO-VEG-500G", barcode: "9300000000081", sizeValue: "500", sizeUnit: "g", packSize: 1, price: "8.99", stock: 34 },
      { name: "5 pack 500g", sku: "FRZ-MOMO-VEG-5PK", barcode: "9300000000082", sizeValue: "500", sizeUnit: "g", packSize: 5, price: "41.99", stock: 9, lowStockThreshold: 2 },
    ],
  },
  {
    name: "Fresh Okra",
    slug: "fresh-okra",
    description: "Fresh okra for curries, stir fries, and bhindi masala.",
    categorySlug: "vegetables",
    brandSlug: "daily-fresh",
    storage: "Refrigerate and use within 3 days.",
    regionTags: ["Indian", "Asian", "General"],
    dietaryTags: ["Vegetarian", "Vegan"],
    image: {
      url: "https://example.supabase.co/storage/v1/object/public/product-images/vegetables/fresh-okra.webp",
      storagePath: "vegetables/fresh-okra.webp",
      altText: "Fresh okra vegetables",
    },
    variants: [
      { name: "500g bag", sku: "VEG-OKRA-500G", barcode: "9300000000091", sizeValue: "500", sizeUnit: "g", packSize: 1, price: "4.99", stock: 26 },
      { name: "1kg bag", sku: "VEG-OKRA-1KG", barcode: "9300000000092", sizeValue: "1", sizeUnit: "kg", packSize: 1, price: "8.99", stock: 14 },
    ],
  },
];

async function main() {
  await prisma.banner.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();

  for (const category of categories) {
    await prisma.category.create({ data: category });
  }

  for (const brand of brands) {
    await prisma.brand.create({ data: brand });
  }

  const categoryBySlug = new Map(
    (await prisma.category.findMany()).map((category) => [category.slug, category]),
  );
  const brandBySlug = new Map((await prisma.brand.findMany()).map((brand) => [brand.slug, brand]));

  for (const product of products) {
    const category = categoryBySlug.get(product.categorySlug);
    const brand = brandBySlug.get(product.brandSlug);

    if (!category) {
      throw new Error(`Missing seed category: ${product.categorySlug}`);
    }

    if (!brand) {
      throw new Error(`Missing seed brand: ${product.brandSlug}`);
    }

    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        ingredients: product.ingredients,
        storage: product.storage,
        origin: product.origin,
        allergens: product.allergens,
        regionTags: product.regionTags,
        dietaryTags: product.dietaryTags ?? [],
        status: "ACTIVE",
        isFeatured: product.isFeatured ?? false,
        categoryId: category.id,
        brandId: brand.id,
        images: {
          create: {
            url: product.image.url,
            storagePath: product.image.storagePath,
            altText: product.image.altText,
            format: "WEBP",
            sizeBytes: 120000,
            width: 1200,
            height: 1200,
            isPrimary: true,
          },
        },
        variants: {
          create: product.variants.map((variant): Prisma.ProductVariantCreateWithoutProductInput => ({
            name: variant.name,
            sku: variant.sku,
            barcode: variant.barcode,
            sizeValue: variant.sizeValue,
            sizeUnit: variant.sizeUnit,
            packSize: variant.packSize,
            price: variant.price,
            salePrice: variant.salePrice,
            stock: variant.stock,
            lowStockThreshold: variant.lowStockThreshold ?? 5,
            imageUrl: variant.imageUrl,
            status: "ACTIVE",
            inventoryLogs: {
              create: {
                changeType: "RESTOCK",
                reason: "SEED",
                quantityChange: variant.stock,
                stockBefore: 0,
                stockAfter: variant.stock,
                note: "Initial seed stock",
              },
            },
          })),
        },
      },
    });
  }

  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        name: "Welcome 10 percent off",
        type: "PERCENT",
        value: "10.00",
        minimumSubtotal: "50.00",
        maxDiscount: "20.00",
        usageLimit: 500,
        isActive: true,
      },
      {
        code: "PANTRY5",
        name: "Pantry saver",
        type: "FIXED_AMOUNT",
        value: "5.00",
        minimumSubtotal: "40.00",
        usageLimit: 300,
        isActive: true,
      },
    ],
  });

  await prisma.banner.createMany({
    data: [
      {
        title: "Stock up on South Asian pantry essentials",
        subtitle: "Rice, dal, masala, noodles, tea, snacks, and frozen favourites.",
        placement: "HOME_HERO",
        linkUrl: "/",
        sortOrder: 10,
        isActive: true,
      },
      {
        title: "Frozen momos and quick meals",
        subtitle: "Convenient favourites for busy weeknights.",
        placement: "HOME_STRIP",
        linkUrl: "/",
        sortOrder: 20,
        isActive: true,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
