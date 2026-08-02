-- Keep privileged identity lookups out of the exposed public schema. Public
-- wrappers remain SECURITY INVOKER and are executable only by authenticated
-- users because customer RLS policies reference their stable names.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.current_app_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT app_user."id"
  FROM public."User" AS app_user
  WHERE (SELECT auth.uid()) IS NOT NULL
    AND app_user."supabaseAuthUserId" = (SELECT auth.uid())::text
    AND app_user."status" = 'ACTIVE'::public."UserStatus"
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION private.current_app_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."User" AS app_user
    WHERE (SELECT auth.uid()) IS NOT NULL
      AND app_user."supabaseAuthUserId" = (SELECT auth.uid())::text
      AND app_user."role" = 'ADMIN'::public."UserRole"
      AND app_user."status" = 'ACTIVE'::public."UserStatus"
  );
$$;

REVOKE ALL ON FUNCTION private.current_app_user_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.current_app_user_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.current_app_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION private.current_app_user_is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, private, pg_temp
AS $$
  SELECT private.current_app_user_id();
$$;

CREATE OR REPLACE FUNCTION public.current_app_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, private, pg_temp
AS $$
  SELECT private.current_app_user_is_admin();
$$;

REVOKE ALL ON FUNCTION public.current_app_user_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_app_user_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_app_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_app_user_is_admin() TO authenticated;

DROP FUNCTION IF EXISTS public.current_jwt_email();

CREATE INDEX IF NOT EXISTS "Order_addressId_idx"
  ON public."Order"("addressId");
