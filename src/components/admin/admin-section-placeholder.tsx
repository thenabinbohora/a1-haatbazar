import { AdminEmptyState } from "@/components/admin/admin-states";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

type AdminSectionPlaceholderProps = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function AdminSectionPlaceholder({
  title,
  description,
  emptyTitle,
  emptyDescription,
}: AdminSectionPlaceholderProps) {
  return (
    <div>
      <AdminPageHeader eyebrow="Protected admin page" title={title} description={description} />
      <AdminEmptyState title={emptyTitle} description={emptyDescription} />
    </div>
  );
}

