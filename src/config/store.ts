import { BUSINESS_CONFIG } from "@/config/business";

export const STORE_CONFIG = {
  storeName: BUSINESS_CONFIG.tradingName,
  address: BUSINESS_CONFIG.address.formatted,
  postalAddress: {
    streetAddress: BUSINESS_CONFIG.address.streetAddress,
    addressLocality: BUSINESS_CONFIG.address.suburb,
    addressRegion: BUSINESS_CONFIG.address.state,
    postalCode: BUSINESS_CONFIG.address.postcode,
    addressCountry: BUSINESS_CONFIG.address.countryCode,
  },
  coordinates: BUSINESS_CONFIG.coordinates,
  openingHours: BUSINESS_CONFIG.openingHours.display,
  openingHoursSpecification: {
    days: BUSINESS_CONFIG.openingHours.days,
    opens: BUSINESS_CONFIG.openingHours.opens,
    closes: BUSINESS_CONFIG.openingHours.closes,
  },
  directionsUrl: BUSINESS_CONFIG.directionsUrl,
  mapEmbedUrl: BUSINESS_CONFIG.mapEmbedUrl,
  pickupMessage: "Free store pickup available from our Salisbury store.",
} as const;
