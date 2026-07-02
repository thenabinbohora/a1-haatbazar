-- Keep authorization fields server-only for direct Supabase API access.
-- Users may still read their own safe profile columns through the existing
-- users_select_own policy, but role/status are reserved for server-side code
-- and SECURITY DEFINER helper checks.
REVOKE SELECT ("role", "status") ON public."User" FROM authenticated;
