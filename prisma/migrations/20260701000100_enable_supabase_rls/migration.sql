-- Enable Supabase Row Level Security for every app-owned public table.
-- This app currently stores users in public."User" and does not have an auth.uid()
-- column. Supabase JWT email is therefore mapped to public."User"."email" for
-- direct Supabase API access, while the Next.js app continues to use server-side
-- Prisma sessions and server-only credentials.

CREATE OR REPLACE FUNCTION public.current_jwt_email()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT lower(
    COALESCE(
      NULLIF(current_setting('request.jwt.claim.email', true), ''),
      NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email'
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT u."id"
  FROM public."User" u
  WHERE lower(u."email") = public.current_jwt_email()
    AND u."status" = 'ACTIVE'::public."UserStatus"
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_app_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."User" u
    WHERE lower(u."email") = public.current_jwt_email()
      AND u."role" = 'ADMIN'::public."UserRole"
      AND u."status" = 'ACTIVE'::public."UserStatus"
  );
$$;

REVOKE ALL ON FUNCTION public.current_jwt_email() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_app_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_app_user_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_jwt_email() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_app_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_app_user_is_admin() TO anon, authenticated;

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Brand" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProductVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProductImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Wishlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Coupon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Banner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."InventoryLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- Replace any previous app-table policies, including unsafe broad policies such
-- as USING (true), with the reviewed policy set below.
DO $$
DECLARE
  existing_policy record;
BEGIN
  FOR existing_policy IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'User',
        'Account',
        'Session',
        'Category',
        'Brand',
        'Product',
        'ProductVariant',
        'ProductImage',
        'Address',
        'Cart',
        'CartItem',
        'Wishlist',
        'Order',
        'OrderItem',
        'Coupon',
        'Banner',
        'InventoryLog',
        '_prisma_migrations'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  END LOOP;
END $$;

-- Lock down direct grants before re-opening only the intended operations.
REVOKE ALL ON public."User" FROM anon, authenticated;
REVOKE ALL ON public."Account" FROM anon, authenticated;
REVOKE ALL ON public."Session" FROM anon, authenticated;
REVOKE ALL ON public."Category" FROM anon, authenticated;
REVOKE ALL ON public."Brand" FROM anon, authenticated;
REVOKE ALL ON public."Product" FROM anon, authenticated;
REVOKE ALL ON public."ProductVariant" FROM anon, authenticated;
REVOKE ALL ON public."ProductImage" FROM anon, authenticated;
REVOKE ALL ON public."Address" FROM anon, authenticated;
REVOKE ALL ON public."Cart" FROM anon, authenticated;
REVOKE ALL ON public."CartItem" FROM anon, authenticated;
REVOKE ALL ON public."Wishlist" FROM anon, authenticated;
REVOKE ALL ON public."Order" FROM anon, authenticated;
REVOKE ALL ON public."OrderItem" FROM anon, authenticated;
REVOKE ALL ON public."Coupon" FROM anon, authenticated;
REVOKE ALL ON public."Banner" FROM anon, authenticated;
REVOKE ALL ON public."InventoryLog" FROM anon, authenticated;
REVOKE ALL ON public."_prisma_migrations" FROM anon, authenticated;

-- Public catalog browsing. Category and Brand do not currently have active flags,
-- so they are read-only public reference data. Product, Variant, Image, and Banner
-- policies only expose active storefront records.
GRANT SELECT ON public."Category" TO anon, authenticated;
GRANT SELECT ON public."Brand" TO anon, authenticated;
GRANT SELECT ON public."Product" TO anon, authenticated;
GRANT SELECT ON public."ProductVariant" TO anon, authenticated;
GRANT SELECT ON public."ProductImage" TO anon, authenticated;
GRANT SELECT ON public."Banner" TO anon, authenticated;

-- Authenticated direct users may read/update only safe profile columns. Password
-- hashes, role, and status remain server-only.
GRANT SELECT (
  "id",
  "email",
  "name",
  "phone",
  "role",
  "status",
  "emailVerified",
  "image",
  "createdAt",
  "updatedAt"
) ON public."User" TO authenticated;
GRANT UPDATE ("name", "phone", "image", "updatedAt") ON public."User" TO authenticated;

-- Customer-owned data can be managed only by the matching authenticated app user.
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Address" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Cart" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."CartItem" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Wishlist" TO authenticated;

-- Orders are customer-readable only. Creation and mutation stay in server-side
-- checkout/admin code so totals, inventory, and status transitions cannot be forged
-- through the client API.
GRANT SELECT ON public."Order" TO authenticated;
GRANT SELECT ON public."OrderItem" TO authenticated;

-- Admin operations are allowed through direct Supabase only for authenticated
-- users whose JWT email maps to an ACTIVE ADMIN row in public."User".
GRANT INSERT, UPDATE, DELETE ON public."Category" TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public."Brand" TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public."Product" TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public."ProductVariant" TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public."ProductImage" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Coupon" TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public."Banner" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."InventoryLog" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Order" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."OrderItem" TO authenticated;

-- Users can read their own active profile row only. No anon user access exists.
CREATE POLICY "users_select_own"
ON public."User"
FOR SELECT
TO authenticated
USING ("id" = public.current_app_user_id());

-- Users can update only non-sensitive profile columns on their own row.
CREATE POLICY "users_update_own_profile"
ON public."User"
FOR UPDATE
TO authenticated
USING ("id" = public.current_app_user_id())
WITH CHECK ("id" = public.current_app_user_id());

-- Category and Brand have no active/status field in the current Prisma schema;
-- they are public read-only taxonomy/reference data.
CREATE POLICY "categories_public_read"
ON public."Category"
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "brands_public_read"
ON public."Brand"
FOR SELECT
TO anon, authenticated
USING (true);

-- Only active products are visible to public storefront readers.
CREATE POLICY "products_public_read_active"
ON public."Product"
FOR SELECT
TO anon, authenticated
USING ("status" = 'ACTIVE'::public."ProductStatus");

-- Only active variants belonging to active products are public.
CREATE POLICY "variants_public_read_active"
ON public."ProductVariant"
FOR SELECT
TO anon, authenticated
USING (
  "status" = 'ACTIVE'::public."VariantStatus"
  AND EXISTS (
    SELECT 1
    FROM public."Product" p
    WHERE p."id" = "ProductVariant"."productId"
      AND p."status" = 'ACTIVE'::public."ProductStatus"
  )
);

-- Product images are public only when their parent product is active.
CREATE POLICY "product_images_public_read_active"
ON public."ProductImage"
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."Product" p
    WHERE p."id" = "ProductImage"."productId"
      AND p."status" = 'ACTIVE'::public."ProductStatus"
  )
);

-- Banners are public only when active and within their optional schedule window.
CREATE POLICY "banners_public_read_active"
ON public."Banner"
FOR SELECT
TO anon, authenticated
USING (
  "isActive" = true
  AND ("startsAt" IS NULL OR "startsAt" <= now())
  AND ("endsAt" IS NULL OR "endsAt" >= now())
);

-- Admin catalog/content policies. Normal authenticated customers fail these checks.
CREATE POLICY "categories_admin_manage"
ON public."Category"
FOR ALL
TO authenticated
USING (public.current_app_user_is_admin())
WITH CHECK (public.current_app_user_is_admin());

CREATE POLICY "brands_admin_manage"
ON public."Brand"
FOR ALL
TO authenticated
USING (public.current_app_user_is_admin())
WITH CHECK (public.current_app_user_is_admin());

CREATE POLICY "products_admin_manage"
ON public."Product"
FOR ALL
TO authenticated
USING (public.current_app_user_is_admin())
WITH CHECK (public.current_app_user_is_admin());

CREATE POLICY "variants_admin_manage"
ON public."ProductVariant"
FOR ALL
TO authenticated
USING (public.current_app_user_is_admin())
WITH CHECK (public.current_app_user_is_admin());

CREATE POLICY "product_images_admin_manage"
ON public."ProductImage"
FOR ALL
TO authenticated
USING (public.current_app_user_is_admin())
WITH CHECK (public.current_app_user_is_admin());

CREATE POLICY "banners_admin_manage"
ON public."Banner"
FOR ALL
TO authenticated
USING (public.current_app_user_is_admin())
WITH CHECK (public.current_app_user_is_admin());

CREATE POLICY "coupons_admin_manage"
ON public."Coupon"
FOR ALL
TO authenticated
USING (public.current_app_user_is_admin())
WITH CHECK (public.current_app_user_is_admin());

-- Address rows contain private customer PII and are scoped by userId.
CREATE POLICY "addresses_select_own"
ON public."Address"
FOR SELECT
TO authenticated
USING ("userId" = public.current_app_user_id());

CREATE POLICY "addresses_insert_own"
ON public."Address"
FOR INSERT
TO authenticated
WITH CHECK ("userId" = public.current_app_user_id());

CREATE POLICY "addresses_update_own"
ON public."Address"
FOR UPDATE
TO authenticated
USING ("userId" = public.current_app_user_id())
WITH CHECK ("userId" = public.current_app_user_id());

CREATE POLICY "addresses_delete_own"
ON public."Address"
FOR DELETE
TO authenticated
USING ("userId" = public.current_app_user_id());

-- Authenticated customers can manage only carts attached to their own userId.
-- Guest carts with only sessionId remain an app/server-session concern.
CREATE POLICY "carts_select_own"
ON public."Cart"
FOR SELECT
TO authenticated
USING ("userId" = public.current_app_user_id());

CREATE POLICY "carts_insert_own"
ON public."Cart"
FOR INSERT
TO authenticated
WITH CHECK ("userId" = public.current_app_user_id());

CREATE POLICY "carts_update_own"
ON public."Cart"
FOR UPDATE
TO authenticated
USING ("userId" = public.current_app_user_id())
WITH CHECK ("userId" = public.current_app_user_id());

CREATE POLICY "carts_delete_own"
ON public."Cart"
FOR DELETE
TO authenticated
USING ("userId" = public.current_app_user_id());

-- Cart items are scoped through their parent cart ownership.
CREATE POLICY "cart_items_select_own"
ON public."CartItem"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."Cart" c
    WHERE c."id" = "CartItem"."cartId"
      AND c."userId" = public.current_app_user_id()
  )
);

CREATE POLICY "cart_items_insert_own"
ON public."CartItem"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."Cart" c
    WHERE c."id" = "CartItem"."cartId"
      AND c."userId" = public.current_app_user_id()
  )
);

CREATE POLICY "cart_items_update_own"
ON public."CartItem"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."Cart" c
    WHERE c."id" = "CartItem"."cartId"
      AND c."userId" = public.current_app_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."Cart" c
    WHERE c."id" = "CartItem"."cartId"
      AND c."userId" = public.current_app_user_id()
  )
);

CREATE POLICY "cart_items_delete_own"
ON public."CartItem"
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."Cart" c
    WHERE c."id" = "CartItem"."cartId"
      AND c."userId" = public.current_app_user_id()
  )
);

-- Wishlist rows are scoped directly by userId.
CREATE POLICY "wishlists_select_own"
ON public."Wishlist"
FOR SELECT
TO authenticated
USING ("userId" = public.current_app_user_id());

CREATE POLICY "wishlists_insert_own"
ON public."Wishlist"
FOR INSERT
TO authenticated
WITH CHECK ("userId" = public.current_app_user_id());

CREATE POLICY "wishlists_delete_own"
ON public."Wishlist"
FOR DELETE
TO authenticated
USING ("userId" = public.current_app_user_id());

-- Customers can read their own orders, but writes stay server-side.
CREATE POLICY "orders_select_own"
ON public."Order"
FOR SELECT
TO authenticated
USING ("userId" = public.current_app_user_id());

CREATE POLICY "order_items_select_own"
ON public."OrderItem"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."Order" o
    WHERE o."id" = "OrderItem"."orderId"
      AND o."userId" = public.current_app_user_id()
  )
);

-- Admins may manage operational order data. Customers cannot update order status
-- or order items because they fail the admin check and have no customer write policy.
CREATE POLICY "orders_admin_manage"
ON public."Order"
FOR ALL
TO authenticated
USING (public.current_app_user_is_admin())
WITH CHECK (public.current_app_user_is_admin());

CREATE POLICY "order_items_admin_manage"
ON public."OrderItem"
FOR ALL
TO authenticated
USING (public.current_app_user_is_admin())
WITH CHECK (public.current_app_user_is_admin());

-- Inventory audit logs are never public and are limited to authenticated admins.
CREATE POLICY "inventory_logs_admin_manage"
ON public."InventoryLog"
FOR ALL
TO authenticated
USING (public.current_app_user_is_admin())
WITH CHECK (public.current_app_user_is_admin());

-- Account, Session, and _prisma_migrations intentionally have no anon/authenticated
-- policies. They are internal tables used by server-side Prisma or Prisma Migrate.
