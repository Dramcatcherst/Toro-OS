-- APPLIED 2026-09-28 after Mauricio explicitly authorized Admin Mode.
-- Supabase migration: 20260928224926_narrow_employee_operational_dashboard_access_20260928.
-- Retained as reviewed SQL evidence outside the repository migration chain.
-- Source: Supabase project abtyrbqlqbsastmridzp.
--
-- Baseline evidence before change:
--   EMPLEADO operational_schedule_workspace -> 12 employees visible.
--   EMPLEADO operational_time_clock_dashboard -> 103 attendance-day rows visible.
--   Direct RLS self-read -> 1 employee for attendance and 1 employee for shifts.
--
-- Verified after migration:
--   EMPLEADO broad schedule RPC -> not authorized.
--   EMPLEADO broad clock RPC -> not authorized.
--   Direct RLS self-read still -> 1 employee for attendance and shifts.
--   ADMIN broad schedule/clock RPCs -> ALLOWED.
--
-- Rollback must restore only the two previous role arrays. Do not change table RLS
-- in the same rollback.

do $$
declare
  fn text;
begin
  select pg_get_functiondef(p.oid) into fn
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname='operational_schedule_workspace';

  if fn is null then
    raise exception 'public.operational_schedule_workspace not found';
  end if;
  if position('''EMPLEADO''' in fn)=0 then
    raise exception 'expected EMPLEADO authorization entry not found in operational_schedule_workspace';
  end if;

  fn := replace(fn, ',''EMPLEADO''', '');
  execute fn;

  select pg_get_functiondef(p.oid) into fn
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname='operational_time_clock_dashboard';

  if fn is null then
    raise exception 'public.operational_time_clock_dashboard not found';
  end if;
  if position('''EMPLEADO''' in fn)=0 then
    raise exception 'expected EMPLEADO authorization entry not found in operational_time_clock_dashboard';
  end if;

  fn := replace(fn, ',''EMPLEADO''', '');
  execute fn;
end $$;

-- Readback:
-- select p.proname,
--        position('''EMPLEADO''' in pg_get_functiondef(p.oid)) > 0 as still_contains_empleado
-- from pg_proc p
-- join pg_namespace n on n.oid=p.pronamespace
-- where n.nspname='public'
--   and p.proname in ('operational_schedule_workspace','operational_time_clock_dashboard');

-- ROLLBACK (prepare-only; do not run unless a verified regression requires it):
-- do $$
-- declare
--   fn text;
-- begin
--   select pg_get_functiondef(p.oid) into fn
--   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
--   where n.nspname='public' and p.proname='operational_schedule_workspace';
--   if fn is null or position('''EMPLEADO''' in fn)>0 then
--     raise exception 'unexpected schedule function state for rollback';
--   end if;
--   fn := replace(fn, '''AUDITOR''', '''AUDITOR'',''EMPLEADO''');
--   execute fn;
--
--   select pg_get_functiondef(p.oid) into fn
--   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
--   where n.nspname='public' and p.proname='operational_time_clock_dashboard';
--   if fn is null or position('''EMPLEADO''' in fn)>0 then
--     raise exception 'unexpected clock function state for rollback';
--   end if;
--   fn := replace(fn, '''AUDITOR''', '''AUDITOR'',''EMPLEADO''');
--   execute fn;
-- end $$;
