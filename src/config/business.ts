import { z } from "zod";

const storeAddress = "3/170 Commercial Rd, Salisbury SA 5108, Australia";
const encodedStoreAddress = encodeURIComponent(storeAddress);

const businessConfigSchema = z.object({
  tradingName: z.string().min(1),
  registeredName: z.string().min(1).nullable(),
  abn: z.string().min(1).nullable(),
  description: z.string().min(1),
  publicEmail: z.string().email(),
  publicPhone: z.string().min(1).nullable(),
  websiteUrl: z.string().url(),
  address: z.object({
    formatted: z.string().min(1),
    streetAddress: z.string().min(1),
    suburb: z.string().min(1),
    state: z.literal("SA"),
    postcode: z.string().regex(/^\d{4}$/),
    country: z.literal("Australia"),
    countryCode: z.literal("AU"),
  }),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  openingHours: z.object({
    display: z.string().min(1),
    days: z.array(z.string().min(1)).length(7),
    opens: z.string().regex(/^\d{2}:\d{2}$/),
    closes: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  directionsUrl: z.string().url(),
  mapEmbedUrl: z.string().url(),
  legalJurisdiction: z.object({
    state: z.literal("South Australia"),
    country: z.literal("Australia"),
  }),
  ordering: z.object({
    currency: z.literal("AUD"),
    guestCheckoutSupported: z.boolean(),
    pricesAndStockCheckedBeforeConfirmation: z.boolean(),
    paymentMethods: z.array(z.enum(["PAY_ON_DELIVERY", "PAY_AT_PICKUP"])),
  }),
  delivery: z.object({
    enabled: z.boolean(),
    serviceArea: z.string().nullable(),
    fee: z.number().nonnegative().nullable(),
    minimumOrder: z.number().nonnegative().nullable(),
    availabilityCheckedBeforeConfirmation: z.boolean(),
    feeConfirmedBeforeFulfilment: z.boolean(),
    unattendedDeliverySupported: z.boolean(),
  }),
  pickup: z.object({
    enabled: z.boolean(),
    free: z.boolean(),
    readinessNotice: z.string().min(1),
    collectionDelegateSettingSupported: z.boolean(),
  }),
});

export const BUSINESS_CONFIG = businessConfigSchema.parse({
  tradingName: "A1 Haat Bazar",
  registeredName: null,
  abn: null,
  description:
    "A local Salisbury grocery store selling authentic Nepali groceries, Indian products, Asian pantry staples, fresh vegetables, frozen products, snacks, rice, lentils, spices, tea and everyday essentials.",
  publicEmail: "hello@a1haatbazar.com.au",
  publicPhone: null,
  websiteUrl: "https://grocery-store-pro.vercel.app",
  address: {
    formatted: storeAddress,
    streetAddress: "3/170 Commercial Rd",
    suburb: "Salisbury",
    state: "SA",
    postcode: "5108",
    country: "Australia",
    countryCode: "AU",
  },
  coordinates: {
    latitude: -34.7521995,
    longitude: 138.6436609,
  },
  openingHours: {
    display: "Open daily, 9:00 AM–7:00 PM",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "09:00",
    closes: "19:00",
  },
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodedStoreAddress}`,
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1639.0673504536403!2d138.64366089839476!3d-34.752199499999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ab0b3ee71d5e371%3A0x14be4cc443c04c6d!2sA-1%20Haat%20Bazar!5e0!3m2!1sen!2sau!4v1783329226559!5m2!1sen!2sau",
  legalJurisdiction: {
    state: "South Australia",
    country: "Australia",
  },
  ordering: {
    currency: "AUD",
    guestCheckoutSupported: true,
    pricesAndStockCheckedBeforeConfirmation: true,
    paymentMethods: ["PAY_ON_DELIVERY", "PAY_AT_PICKUP"],
  },
  delivery: {
    enabled: true,
    serviceArea: null,
    fee: null,
    minimumOrder: null,
    availabilityCheckedBeforeConfirmation: true,
    feeConfirmedBeforeFulfilment: true,
    unattendedDeliverySupported: false,
  },
  pickup: {
    enabled: true,
    free: true,
    readinessNotice: "We will contact you when your order is packed and ready for pickup.",
    collectionDelegateSettingSupported: false,
  },
});

export type BusinessConfig = z.infer<typeof businessConfigSchema>;
