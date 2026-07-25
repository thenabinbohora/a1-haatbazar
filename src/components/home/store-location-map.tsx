import { STORE_CONFIG } from "@/config/store";

export function StoreLocationMap() {
  return (
    <div className="relative h-[clamp(210px,56.25vw,240px)] w-full overflow-hidden rounded-2xl border border-border bg-surface-muted shadow-sm md:h-full md:min-h-[380px]">
      <iframe
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={STORE_CONFIG.mapEmbedUrl}
        title="Map showing A1 Haat Bazar in Salisbury"
      />
    </div>
  );
}
