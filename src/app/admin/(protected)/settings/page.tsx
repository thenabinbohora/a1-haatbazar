import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminSettingsPage() {
  const sections = [
    {
      title: "Store profile",
      description: "Store name, contact email, phone, support hours, and customer-facing address.",
    },
    {
      title: "Delivery and pickup",
      description: "Service areas, minimum order amount, pickup windows, shipping fees, and free-delivery thresholds.",
    },
    {
      title: "Tax and checkout",
      description: "Tax handling, payment provider configuration, checkout abuse prevention, and order number rules.",
    },
    {
      title: "Images and storage",
      description: "Supabase Storage bucket, safe image formats, max upload size, and admin-only write policies.",
    },
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Operations"
        title="Settings"
        description="Protected settings planning area. Persistent settings writes need a dedicated settings model and migration before save controls are enabled."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm" key={section.title}>
            <h2 className="text-lg font-semibold text-text">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">{section.description}</p>
            <div className="mt-4 rounded-md border border-warning bg-surface-muted p-3 text-sm font-semibold text-text">
              Planned, not writable yet
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
