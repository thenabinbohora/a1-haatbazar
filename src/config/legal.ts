import type { Metadata } from "next";
import { z } from "zod";
import { BUSINESS_CONFIG } from "@/config/business";

const legalDocumentSchema = z.object({
  path: z.string().startsWith("/"),
  title: z.string().min(1),
  metadataTitle: z.string().min(1),
  metadataDescription: z.string().min(1),
  introduction: z.string().min(1),
  lastUpdated: z.string().min(1),
  lastUpdatedIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const legalConfigSchema = z.object({
  reviewStatus: z.enum(["draft", "approved"]),
  documents: z.record(
    z.enum([
      "privacy",
      "terms",
      "returnsRefunds",
      "deliveryPickup",
      "cookies",
      "productInformation",
      "accessibility",
    ]),
    legalDocumentSchema,
  ),
});

const configuredReviewStatus = process.env.LEGAL_REVIEW_STATUS?.trim().toLowerCase();

export const LEGAL_CONFIG = legalConfigSchema.parse({
  reviewStatus: configuredReviewStatus === "approved" ? "approved" : "draft",
  documents: {
    privacy: {
      path: "/privacy",
      title: "Privacy Policy",
      metadataTitle: `Privacy Policy | ${BUSINESS_CONFIG.tradingName}`,
      metadataDescription:
        `How ${BUSINESS_CONFIG.tradingName} collects, uses, stores and shares personal information when customers browse, create accounts and order groceries.`,
      introduction:
        "This policy explains, in plain language, how we handle personal information when you browse our store, create an account, save products or place a delivery or pickup order.",
      lastUpdated: "25 July 2026",
      lastUpdatedIso: "2026-07-25",
    },
    terms: {
      path: "/terms",
      title: "Terms and Conditions",
      metadataTitle: `Terms and Conditions | ${BUSINESS_CONFIG.tradingName}`,
      metadataDescription:
        `Terms for using the ${BUSINESS_CONFIG.tradingName} website and submitting local delivery or store pickup grocery orders.`,
      introduction:
        "These terms apply when you use our website, create an account or submit a grocery order for local delivery or free store pickup.",
      lastUpdated: "25 July 2026",
      lastUpdatedIso: "2026-07-25",
    },
    returnsRefunds: {
      path: "/returns-refunds",
      title: "Returns, Refunds and Replacements",
      metadataTitle: `Returns, Refunds and Replacements | ${BUSINESS_CONFIG.tradingName}`,
      metadataDescription:
        `${BUSINESS_CONFIG.tradingName} policy for faulty, damaged, unsafe, missing or incorrect groceries and other return requests.`,
      introduction:
        "This policy explains how we assess problems with groceries and the remedies that may be available, including your rights under the Australian Consumer Law.",
      lastUpdated: "25 July 2026",
      lastUpdatedIso: "2026-07-25",
    },
    deliveryPickup: {
      path: "/delivery-pickup",
      title: "Delivery and Pickup Policy",
      metadataTitle: `Delivery and Pickup Policy | ${BUSINESS_CONFIG.tradingName}`,
      metadataDescription:
        `How local delivery availability, fees, order timing and free pickup from ${BUSINESS_CONFIG.tradingName} in Salisbury are handled.`,
      introduction:
        "Choose local delivery or free pickup at checkout. We confirm stock, delivery availability and any delivery fee before fulfilment.",
      lastUpdated: "25 July 2026",
      lastUpdatedIso: "2026-07-25",
    },
    cookies: {
      path: "/cookies",
      title: "Cookie Policy",
      metadataTitle: `Cookie Policy | ${BUSINESS_CONFIG.tradingName}`,
      metadataDescription:
        `The cookies and browser storage used by ${BUSINESS_CONFIG.tradingName} for sign-in, checkout, cart and password-recovery functions.`,
      introduction:
        "Our site currently uses only storage needed for core shopping, account security, checkout and password-recovery functions. We do not currently use analytics or advertising trackers.",
      lastUpdated: "25 July 2026",
      lastUpdatedIso: "2026-07-25",
    },
    productInformation: {
      path: "/product-information",
      title: "Product and Allergen Information",
      metadataTitle: `Product and Allergen Information | ${BUSINESS_CONFIG.tradingName}`,
      metadataDescription:
        "Important guidance about grocery images, packaging, ingredients, allergens, nutrition, origin, fresh produce and product recalls.",
      introduction:
        "Online grocery information helps you choose products, but packaging and manufacturer information can change. Always check the physical product before use.",
      lastUpdated: "25 July 2026",
      lastUpdatedIso: "2026-07-25",
    },
    accessibility: {
      path: "/accessibility",
      title: "Accessibility Statement",
      metadataTitle: `Accessibility Statement | ${BUSINESS_CONFIG.tradingName}`,
      metadataDescription:
        `${BUSINESS_CONFIG.tradingName}'s accessibility approach, supported shopping features, known limitations and contact details for reporting barriers.`,
      introduction:
        "We want customers to be able to browse groceries, manage an account and place an order using the device and access method that works for them.",
      lastUpdated: "25 July 2026",
      lastUpdatedIso: "2026-07-25",
    },
  },
});

export type LegalDocumentKey = keyof typeof LEGAL_CONFIG.documents;
export type LegalDocumentConfig = (typeof LEGAL_CONFIG.documents)[LegalDocumentKey];

export const SHOW_LEGAL_DRAFT_NOTICE =
  process.env.NODE_ENV !== "production" && LEGAL_CONFIG.reviewStatus !== "approved";

export function legalMetadata(document: LegalDocumentConfig): Metadata {
  return {
    title: { absolute: document.metadataTitle },
    description: document.metadataDescription,
    alternates: {
      canonical: new URL(document.path, BUSINESS_CONFIG.websiteUrl).toString(),
    },
    openGraph: {
      type: "article",
      title: document.metadataTitle,
      description: document.metadataDescription,
      url: new URL(document.path, BUSINESS_CONFIG.websiteUrl).toString(),
      siteName: BUSINESS_CONFIG.tradingName,
      locale: "en_AU",
    },
  };
}
