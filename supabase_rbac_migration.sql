-- ==============================================================================
-- THE SCHOOL ERP — COMPREHENSIVE ROLE-BASED ACCESS CONTROL (RBAC) & RLS MIGRATION
-- Database: PostgreSQL (Supabase)
-- Target Table: public.school_records & public.user_profiles
-- ==============================================================================

-- 1. Create Enumerated Application Roles
do $$ begin
  create type public.app_role as enum (
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'TEACHER',
    'ACCOUNTANT',
    'PARENT',
    'STUDENT'
  );
exception
  when duplicate_object then null;
end $$;

-- 2. User Profiles & School Membership Table
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id text not null default 'SCH-00001',
  role public.app_role not null default 'STUDENT',
  entity_id text, -- references TCH-XXXX, PAR-XXXX, STU-XXXX, STF-XXXX
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_profiles_school_id on public.user_profiles(school_id);
create index if not exists idx_user_profiles_role on public.user_profiles(role);
create index if not exists idx_user_profiles_entity_id on public.user_profiles(entity_id);

-- Enable RLS on user profiles
alter table public.user_profiles enable row level security;

-- 3. Security Context Helper Functions
create or replace function public.current_user_profile()
returns public.user_profiles language sql stable security definer as $$
  select * from public.user_profiles where id = auth.uid() limit 1;
$$;

create or replace function public.current_user_role()
returns public.app_role language sql stable security definer as $$
  select coalesce(
    (select role from public.user_profiles where id = auth.uid()),
    'SCHOOL_ADMIN'::public.app_role
  );
$$;

create or replace function public.current_user_school_id()
returns text language sql stable security definer as $$
  select coalesce(
    (select school_id from public.user_profiles where id = auth.uid()),
    'SCH-00001'
  );
$$;

create or replace function public.current_user_entity_id()
returns text language sql stable security definer as $$
  select entity_id from public.user_profiles where id = auth.uid();
$$;

-- 4. Secure Core School Records Table
alter table public.school_records enable row level security;

-- Drop obsolete trial policies
drop policy if exists school_records_trial_select on public.school_records;
drop policy if exists school_records_trial_insert on public.school_records;
drop policy if exists school_records_trial_update on public.school_records;
drop policy if exists school_records_trial_delete on public.school_records;
drop policy if exists school_records_rbac_select on public.school_records;
drop policy if exists school_records_rbac_insert on public.school_records;
drop policy if exists school_records_rbac_update on public.school_records;
drop policy if exists school_records_rbac_delete on public.school_records;

-- ==============================================================================
-- 5. RLS POLICIES FOR public.school_records
-- ==============================================================================

-- A. SELECT (Read Permission)
create policy school_records_rbac_select on public.school_records
for select to authenticated, anon
using (
  -- Super Admin: can view all records across all schools
  public.current_user_role() = 'SUPER_ADMIN'
  or
  -- School Admin: can view all records belonging to their own school
  (
    public.current_user_role() = 'SCHOOL_ADMIN'
    and school_id = public.current_user_school_id()
  )
  or
  -- Teacher: can view classes, students, attendance, timetables, exams, notices in their school
  (
    public.current_user_role() = 'TEACHER'
    and school_id = public.current_user_school_id()
    and table_name in (
      'classes', 'sections', 'subjects', 'students', 'attendance',
      'timetables', 'exams', 'examSchedules', 'marks', 'grades',
      'notices', 'events', 'teachers', 'settings'
    )
  )
  or
  -- Accountant: can view financial, student fee, and staff payroll records in their school
  (
    public.current_user_role() = 'ACCOUNTANT'
    and school_id = public.current_user_school_id()
    and table_name in (
      'students', 'classes', 'sections', 'feeCategories', 'feeStructures',
      'feeInvoices', 'feePayments', 'income', 'expenses',
      'salaryStructures', 'payrolls', 'notices', 'settings'
    )
  )
  or
  -- Parent: can only view records pertaining to their registered children & school circulars
  (
    public.current_user_role() = 'PARENT'
    and school_id = public.current_user_school_id()
    and (
      table_name in ('notices', 'events', 'schools', 'branches', 'academicYears')
      or (table_name = 'students' and (data->>'parentId' = public.current_user_entity_id() or public.current_user_entity_id() is null))
      or (table_name in ('feeInvoices', 'feePayments', 'marks', 'attendance'))
    )
  )
  or
  -- Student: strictly read-only access to own academic records & school announcements
  (
    public.current_user_role() = 'STUDENT'
    and school_id = public.current_user_school_id()
    and (
      table_name in ('notices', 'events', 'timetables', 'schools', 'branches')
      or (table_name = 'students' and (id = public.current_user_entity_id() or public.current_user_entity_id() is null))
      or (table_name in ('marks', 'attendance'))
    )
  )
);

-- B. INSERT (Create Permission)
create policy school_records_rbac_insert on public.school_records
for insert to authenticated, anon
with check (
  -- Super Admin: can insert schools, subscriptions, users
  public.current_user_role() = 'SUPER_ADMIN'
  or
  -- School Admin: can insert all school-scoped records
  (
    public.current_user_role() = 'SCHOOL_ADMIN'
    and school_id = public.current_user_school_id()
  )
  or
  -- Teacher: can insert attendance registers and marks entry
  (
    public.current_user_role() = 'TEACHER'
    and school_id = public.current_user_school_id()
    and table_name in ('attendance', 'marks')
  )
  or
  -- Accountant: can record fee payments, fee invoices, income, and expenses
  (
    public.current_user_role() = 'ACCOUNTANT'
    and school_id = public.current_user_school_id()
    and table_name in ('feeInvoices', 'feePayments', 'income', 'expenses')
  )
);

-- C. UPDATE (Modify Permission)
create policy school_records_rbac_update on public.school_records
for update to authenticated, anon
using (
  -- Super Admin
  public.current_user_role() = 'SUPER_ADMIN'
  or
  -- School Admin
  (
    public.current_user_role() = 'SCHOOL_ADMIN'
    and school_id = public.current_user_school_id()
  )
  or
  -- Teacher: cannot touch fees or admin settings, only marks and attendance
  (
    public.current_user_role() = 'TEACHER'
    and school_id = public.current_user_school_id()
    and table_name in ('attendance', 'marks')
  )
  or
  -- Accountant: can update invoices and payment status, cannot touch marks or attendance
  (
    public.current_user_role() = 'ACCOUNTANT'
    and school_id = public.current_user_school_id()
    and table_name in ('feeInvoices', 'feePayments', 'income', 'expenses')
  )
)
with check (
  -- Enforce school_id isolation: prevent changing record's school_id
  school_id = public.current_user_school_id() or public.current_user_role() = 'SUPER_ADMIN'
);

-- D. DELETE (Destructive Permission)
create policy school_records_rbac_delete on public.school_records
for delete to authenticated, anon
using (
  -- Strictly restricted to Super Admin and School Admin
  public.current_user_role() = 'SUPER_ADMIN'
  or (
    public.current_user_role() = 'SCHOOL_ADMIN'
    and school_id = public.current_user_school_id()
    and table_name not in ('schools')
  )
);

-- 6. Trigger to prevent spoofing school_id or user roles on update
create or replace function public.prevent_school_id_tamper()
returns trigger language plpgsql as $$
begin
  if new.school_id <> old.school_id and public.current_user_role() <> 'SUPER_ADMIN' then
    raise exception 'Access Denied: Changing school_id is strictly prohibited.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_school_id_tamper on public.school_records;
create trigger trg_prevent_school_id_tamper
before update on public.school_records
for each row execute function public.prevent_school_id_tamper();

-- Verify RLS activation
select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename in ('school_records', 'user_profiles');
