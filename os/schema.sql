-- LizOn OS pilot schema. Run in the SAME Supabase project as /portal.
-- Do not run on a public endpoint; use Supabase SQL Editor with administrator access.
-- The migration is idempotent for new tables. Review before applying to any preexisting tables.
create table if not exists public.lizon_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) between 1 and 120),
  phone text not null check (char_length(trim(phone)) between 3 and 35),
  email text,
  interest text not null default 'study_abroad' check (interest in ('study_abroad','ielts','pte','spoken','other')),
  source text not null default 'manual' check (source in ('manual','website','facebook','messenger','whatsapp','referral','call')),
  status text not null default 'new' check (status in ('new','contacted','interested','consultation','enrolled','lost')),
  priority text not null default 'normal' check (priority in ('normal','high','urgent')),
  country text,
  course text,
  budget_bdt numeric(13,0) check (budget_bdt >= 0),
  fee_total_bdt numeric(13,0) not null default 0 check (fee_total_bdt >= 0),
  fee_paid_bdt numeric(13,0) not null default 0 check (fee_paid_bdt >= 0 and fee_paid_bdt <= fee_total_bdt),
  next_followup date,
  notes text check (char_length(notes) <= 4000),
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists lizon_leads_assigned_idx on public.lizon_leads (assigned_to, next_followup);
create index if not exists lizon_leads_creator_idx on public.lizon_leads (created_by);
create index if not exists lizon_leads_status_idx on public.lizon_leads (status);

create table if not exists public.lizon_lead_activity (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.lizon_leads(id) on delete cascade,
  kind text not null default 'note' check (kind in ('note','call','meeting','followup','system')),
  body text not null check (char_length(trim(body)) between 1 and 1200),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists lizon_lead_activity_lead_idx on public.lizon_lead_activity (lead_id, created_at desc);

-- Definer helpers resolve existing /portal public.profiles safely, avoiding RLS recursion.
create or replace function public.lizon_staff_role()
returns text language sql stable security definer set search_path = ''
as $$
  select lower(coalesce(p.role, '')) from public.profiles p
  where p.id = (select auth.uid()) and p.status = 'active' limit 1;
$$;
create or replace function public.lizon_is_staff()
returns boolean language sql stable security definer set search_path = ''
as $$
  select coalesce(public.lizon_staff_role() in ('admin','super_admin','manager','admissions','admission','counselor'), false);
$$;
create or replace function public.lizon_is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select coalesce(public.lizon_staff_role() in ('admin','super_admin','manager'), false);
$$;
create or replace function public.lizon_can_access_lead(_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select public.lizon_is_staff() and exists(
    select 1 from public.lizon_leads l
    where l.id = _id
      and (public.lizon_is_admin() or l.created_by = (select auth.uid()) or l.assigned_to = (select auth.uid()))
  );
$$;
revoke all on function public.lizon_staff_role() from public, anon;
revoke all on function public.lizon_is_staff() from public, anon;
revoke all on function public.lizon_is_admin() from public, anon;
revoke all on function public.lizon_can_access_lead(uuid) from public, anon;
grant execute on function public.lizon_staff_role() to authenticated;
grant execute on function public.lizon_is_staff() to authenticated;
grant execute on function public.lizon_is_admin() to authenticated;
grant execute on function public.lizon_can_access_lead(uuid) to authenticated;

create or replace function public.lizon_guard_lead_update()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.created_by is distinct from old.created_by then
    raise exception 'Lead creator cannot be changed';
  end if;
  if not public.lizon_is_admin() then
    if new.assigned_to is distinct from old.assigned_to
       or new.fee_total_bdt is distinct from old.fee_total_bdt
       or new.fee_paid_bdt is distinct from old.fee_paid_bdt then
      raise exception 'Only authorized managers can reassign leads or edit fees';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists lizon_leads_guard on public.lizon_leads;
create trigger lizon_leads_guard before update on public.lizon_leads
for each row execute function public.lizon_guard_lead_update();

alter table public.lizon_leads enable row level security;
alter table public.lizon_lead_activity enable row level security;

drop policy if exists "lizon_leads_read" on public.lizon_leads;
create policy "lizon_leads_read" on public.lizon_leads for select to authenticated
using (public.lizon_is_staff() and (public.lizon_is_admin() or created_by = (select auth.uid()) or assigned_to = (select auth.uid())));

drop policy if exists "lizon_leads_add" on public.lizon_leads;
create policy "lizon_leads_add" on public.lizon_leads for insert to authenticated
with check (public.lizon_is_staff() and created_by = (select auth.uid())
  and (assigned_to is null or assigned_to = (select auth.uid()) or public.lizon_is_admin()));

drop policy if exists "lizon_leads_edit" on public.lizon_leads;
create policy "lizon_leads_edit" on public.lizon_leads for update to authenticated
using (public.lizon_is_staff() and (public.lizon_is_admin() or created_by = (select auth.uid()) or assigned_to = (select auth.uid())))
with check (public.lizon_is_staff() and (public.lizon_is_admin() or created_by = (select auth.uid()) or assigned_to = (select auth.uid())));

drop policy if exists "lizon_activity_read" on public.lizon_lead_activity;
create policy "lizon_activity_read" on public.lizon_lead_activity for select to authenticated
using (public.lizon_can_access_lead(lead_id));

drop policy if exists "lizon_activity_add" on public.lizon_lead_activity;
create policy "lizon_activity_add" on public.lizon_lead_activity for insert to authenticated
with check (created_by = (select auth.uid()) and public.lizon_can_access_lead(lead_id));

-- No client DELETE on leads and no client UPDATE/DELETE on immutable activity.
revoke all on public.lizon_leads from anon;
revoke all on public.lizon_lead_activity from anon;
revoke all on public.lizon_leads from authenticated;
revoke all on public.lizon_lead_activity from authenticated;
grant select, insert, update on public.lizon_leads to authenticated;
grant select, insert on public.lizon_lead_activity to authenticated;

-- Verify with two test staff users before adding any real student data.
-- Admin should see all leads. Counselor should see only created/assigned leads.
-- Student and anonymous sessions must not be able to read or write any rows.
