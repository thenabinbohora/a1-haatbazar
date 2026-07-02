const storeAddress = "3/170 Commercial Rd, Salisbury SA 5108, Australia";
const encodedStoreAddress = encodeURIComponent(storeAddress);

export const STORE_CONFIG = {
  storeName: "A1 Haat Bazar",
  address: storeAddress,
  openingHours: "Open daily from 9:00 AM to 7:00 PM",
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodedStoreAddress}`,
  mapEmbedUrl: `https://www.google.com/maps?q=${encodedStoreAddress}&output=embed`,
  pickupMessage: "Choose store pickup at checkout and we'll contact you when your order is ready.",
  deliveryMessage: "Local delivery details are confirmed by our team.",
  paymentMessage: "Cash on delivery or pay at pickup available.",
} as const;
