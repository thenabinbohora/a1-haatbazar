type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      // Escape "<" so closing tags inside data can never break out of the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
      type="application/ld+json"
    />
  );
}
