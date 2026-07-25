import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL_CONFIG, legalMetadata } from "@/config/legal";

export const metadata = legalMetadata(LEGAL_CONFIG.documents.deliveryPickup);

export default function DeliveryPickupPage() {
  return <LegalDocument documentKey="deliveryPickup" />;
}
