-- Keep RLS helper functions usable only by the roles that need them.
-- Trigger functions do not need direct Data API execution privileges.

revoke execute on function public.enforce_profile_role_boundary() from public, anon, authenticated;

-- Authenticated requests must be able to evaluate this function inside RLS
-- policies. Anonymous callers do not need to invoke it directly.
revoke execute on function public.is_lms_admin() from public, anon;
grant execute on function public.is_lms_admin() to authenticated, service_role;
