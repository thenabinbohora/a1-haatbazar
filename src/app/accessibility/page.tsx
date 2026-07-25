import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL_CONFIG, legalMetadata } from "@/config/legal";

export const metadata = legalMetadata(LEGAL_CONFIG.documents.accessibility);

export default function AccessibilityPage() {
  return <LegalDocument documentKey="accessibility" />;
}
