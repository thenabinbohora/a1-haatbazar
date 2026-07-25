import Link from "next/link";
import type { ReactNode } from "react";
import { BUSINESS_CONFIG } from "@/config/business";
import {
  LEGAL_CONFIG,
  SHOW_LEGAL_DRAFT_NOTICE,
  type LegalDocumentConfig,
  type LegalDocumentKey,
} from "@/config/legal";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalPageProps = {
  document: LegalDocumentConfig;
  related: readonly LegalDocumentKey[];
  sections: readonly LegalSection[];
};

const legalLinkClass =
  "rounded-sm font-bold text-primary underline decoration-cta/55 decoration-2 underline-offset-4 transition-colors hover:text-cta-hover hover:decoration-cta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta";

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function TableOfContents({
  label,
  sections,
}: {
  label: string;
  sections: readonly LegalSection[];
}) {
  return (
    <nav aria-label={label}>
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-fresh">
        On this page
      </p>
      <ol className="mt-3 grid gap-1 text-sm leading-6 text-text-muted">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              className="flex min-h-11 items-center rounded-lg px-3 py-2 font-semibold transition-colors hover:bg-fresh-soft hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href={`#${section.id}`}
            >
              {section.title}
            </a>
          </li>
        ))}
        <li>
          <a
            className="flex min-h-11 items-center rounded-lg px-3 py-2 font-semibold transition-colors hover:bg-fresh-soft hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href="#contact"
          >
            Contact us
          </a>
        </li>
      </ol>
    </nav>
  );
}

export function PolicyLink({
  children,
  documentKey,
}: {
  children?: ReactNode;
  documentKey: LegalDocumentKey;
}) {
  const document = LEGAL_CONFIG.documents[documentKey];

  return (
    <Link className={legalLinkClass} href={document.path}>
      {children ?? document.title}
    </Link>
  );
}

export function StoreLink({ children = "back to the store" }: { children?: ReactNode }) {
  return (
    <Link className={legalLinkClass} href="/">
      {children}
    </Link>
  );
}

export function ExternalLegalLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <a className={legalLinkClass} href={href} rel="noopener noreferrer" target="_blank">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function LegalSubsection({
  children,
  id,
  title,
}: {
  children: ReactNode;
  id: string;
  title: string;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="legal-subsection" id={id}>
      <h3 id={`${id}-heading`}>{title}</h3>
      {children}
    </section>
  );
}

export function LegalNote({
  children,
  tone = "information",
}: {
  children: ReactNode;
  tone?: "information" | "important";
}) {
  return (
    <div
      className={
        tone === "important"
          ? "legal-note border-cta/30 bg-cta-soft"
          : "legal-note border-fresh/25 bg-fresh-soft"
      }
      role="note"
    >
      {children}
    </div>
  );
}

export function LegalTable({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <div
      aria-label={`${caption}. Scroll horizontally to view all columns on a small screen.`}
      className="legal-table-wrap"
      role="region"
      tabIndex={0}
    >
      <table>
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function LegalPage({ document, related, sections }: LegalPageProps) {
  return (
    <div className="legal-page overflow-x-clip bg-background">
      <header className="legal-hero border-b border-border bg-[linear-gradient(135deg,#F3EBDD_0%,#F7F6F1_55%,#EDF5EF_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8 lg:py-14">
          <nav aria-label="Breadcrumb" className="legal-screen-only">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-text-muted">
              <li>
                <Link
                  className="inline-flex min-h-11 items-center rounded-md px-1 underline-offset-4 hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href="/"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{document.title}</li>
            </ol>
          </nav>

          {SHOW_LEGAL_DRAFT_NOTICE ? (
            <div
              className="mt-4 max-w-3xl rounded-xl border border-warning/30 bg-white px-4 py-3 text-sm font-bold leading-6 text-warning shadow-sm"
              role="note"
            >
              Draft legal document — professional review required before publication.
            </div>
          ) : null}

          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-fresh sm:mt-7">
            Customer information
          </p>
          <h1 className="mt-2 max-w-4xl text-3xl font-black leading-tight tracking-tight text-text sm:text-4xl lg:text-5xl">
            {document.title}
          </h1>
          <p className="mt-4 max-w-[70ch] text-base leading-7 text-text-muted sm:text-lg sm:leading-8">
            {document.introduction}
          </p>
          <p className="mt-4 text-sm font-semibold text-text-muted">
            Last updated: <time dateTime={document.lastUpdatedIso}>{document.lastUpdated}</time>
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8 lg:py-14">
        <div className="mb-8 rounded-2xl border border-border bg-surface p-4 shadow-sm lg:hidden">
          <details className="group">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta">
              Contents
              <span
                aria-hidden="true"
                className="grid h-8 w-8 place-items-center rounded-full bg-fresh-soft transition-transform group-open:rotate-90"
              >
                <ArrowIcon />
              </span>
            </summary>
            <div className="border-t border-border pt-3">
              <TableOfContents label={`${document.title} contents`} sections={sections} />
            </div>
          </details>
        </div>

        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start lg:gap-14">
          <article className="legal-article min-w-0 max-w-[72ch]">
            {sections.map((section) => (
              <section
                aria-labelledby={`${section.id}-heading`}
                className="legal-section"
                id={section.id}
                key={section.id}
              >
                <h2 id={`${section.id}-heading`}>{section.title}</h2>
                {section.content}
              </section>
            ))}

            <section aria-labelledby="contact-heading" className="legal-section" id="contact">
              <h2 id="contact-heading">Contact us</h2>
              <p>
                For a question, request or concern about this document, email{" "}
                <a className={legalLinkClass} href={`mailto:${BUSINESS_CONFIG.publicEmail}`}>
                  {BUSINESS_CONFIG.publicEmail}
                </a>
                . Please include enough information for us to understand and respond to your
                request, but do not send passwords or payment details.
              </p>
              <address className="not-italic">
                <strong>{BUSINESS_CONFIG.tradingName}</strong>
                <br />
                {BUSINESS_CONFIG.address.formatted}
                <br />
                {BUSINESS_CONFIG.openingHours.display}
              </address>
              <p>
                You can also <StoreLink>return to the online store</StoreLink> or{" "}
                <a
                  className={legalLinkClass}
                  href={BUSINESS_CONFIG.directionsUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  get directions
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                .
              </p>
            </section>

            <nav
              aria-label={`Policies related to ${document.title}`}
              className="legal-related legal-screen-only mt-12 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-xl font-black text-text">Related information</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {related.map((documentKey) => {
                  const relatedDocument = LEGAL_CONFIG.documents[documentKey];

                  return (
                    <li key={documentKey}>
                      <Link
                        className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm font-bold text-primary transition-colors hover:border-fresh/40 hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                        href={relatedDocument.path}
                      >
                        {relatedDocument.title}
                        <ArrowIcon />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </article>

          <aside className="legal-screen-only sticky top-28 hidden rounded-2xl border border-border bg-surface p-4 shadow-sm lg:block">
            <TableOfContents label={`${document.title} contents`} sections={sections} />
          </aside>
        </div>
      </div>
    </div>
  );
}
