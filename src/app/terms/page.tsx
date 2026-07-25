import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL_CONFIG, legalMetadata } from "@/config/legal";

export const metadata = legalMetadata(LEGAL_CONFIG.documents.terms);

export default function TermsPage() {
  return <LegalDocument documentKey="terms" />;
}
