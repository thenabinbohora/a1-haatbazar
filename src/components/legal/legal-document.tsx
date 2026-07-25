import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL_CONFIG, type LegalDocumentKey } from "@/config/legal";
import { LEGAL_DOCUMENT_CONTENT } from "@/content/legal-documents";

export function LegalDocument({ documentKey }: { documentKey: LegalDocumentKey }) {
  const document = LEGAL_CONFIG.documents[documentKey];
  const content = LEGAL_DOCUMENT_CONTENT[documentKey];

  return (
    <LegalPage
      document={document}
      related={content.related}
      sections={content.sections}
    />
  );
}
