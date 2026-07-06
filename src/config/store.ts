const storeAddress = "3/170 Commercial Rd, Salisbury SA 5108, Australia";
const encodedStoreAddress = encodeURIComponent(storeAddress);

export const STORE_CONFIG = {
  storeName: "A1 Haat Bazar",
  address: storeAddress,
  openingHours: "Open daily: 9:00 AM - 7:00 PM",
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodedStoreAddress}`,
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1639.0673504536403!2d138.64366089839476!3d-34.752199499999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ab0b3ee71d5e371%3A0x14be4cc443c04c6d!2sA-1%20Haat%20Bazar!5e0!3m2!1sen!2sau!4v1783329226559!5m2!1sen!2sau",
  pickupMessage: "Free store pickup available from our Salisbury store.",
  deliveryMessage: "Local delivery details are confirmed by our team.",
  paymentMessage: "Cash on delivery or pay at pickup available.",
} as const;
