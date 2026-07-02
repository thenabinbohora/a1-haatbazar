# Supabase Storage Setup

Stage 6 product image upload uses Supabase Storage through server-side admin actions.

## Required Environment Variables

Store real values in `.env.local` only. Do not commit them.

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="server-only-service-role-key"
SUPABASE_STORAGE_BUCKET="product-images"
```

`NEXT_PUBLIC_SUPABASE_URL` is browser-safe, but `SUPABASE_SERVICE_ROLE_KEY` is not. The service role key must remain server-only.

## Bucket

Create a Supabase Storage bucket:

```text
product-images
```

Recommended bucket posture for this stage:

- Public read if product images are meant to appear in storefront catalog pages.
- No direct browser writes.
- Writes, updates, and deletes should go through protected server actions only.

## Validation Rules

The app validates image files before upload:

- Allowed MIME types:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- Allowed extensions:
  - `jpg`
  - `jpeg`
  - `png`
  - `webp`
- Maximum size:
  - `5MB`

The server generates storage paths. Admin users cannot choose arbitrary storage paths.

## Storage Policy Notes

Because uploads currently use server-side actions with the service role key, browser clients do not need direct write access to the bucket.

If you enable Supabase client-side reads for storefront images later:

- Allow public read only for the `product-images` bucket if catalog images are public.
- Keep insert, update, and delete policies denied for ordinary customers.
- If admin direct uploads are ever added through Supabase client SDK, policies must verify a trusted admin role source.
- Do not trust client-editable metadata for admin checks.

Example policy posture:

```text
SELECT: allow public reads for product-images if storefront images are public.
INSERT: deny by default; server action uploads with service role.
UPDATE: deny by default; server action replacements with service role.
DELETE: deny by default; server action removals with service role.
```

## Admin Browser Testing

1. Log in as an admin.
2. Create or open an existing product.
3. Upload a main image from `/admin/products/[productId]/edit`.
4. Upload one or more gallery images.
5. Replace a gallery image.
6. Remove a gallery image.
7. Try an invalid file type and confirm it is rejected.
8. Try an image larger than 5MB and confirm it is rejected.
