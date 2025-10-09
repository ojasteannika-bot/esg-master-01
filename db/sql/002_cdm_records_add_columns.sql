-- CDM records: veerud, indeksid, triggerid
-- Ohutult idempotentne (IF NOT EXISTS)

-- 1) Põhiveerud
alter table public.cdm_records
  add column if not exists code text,                      -- nt "B1-1"
  add column if not exists section_code text,              -- nt "B1"
  add column if not exists status text not null default 'draft',
  add column if not exists value jsonb,                    -- vastuse sisu (string, obj jne -> jsonb)
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- 2) Kiiremad päringud
create index if not exists idx_cdm_project_code
  on public.cdm_records (project_id, code);

create index if not exists idx_cdm_project_section
  on public.cdm_records (project_id, section_code);

create index if not exists idx_cdm_status
  on public.cdm_records (status);

-- 3) updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists set_updated_at_cdm on public.cdm_records;
create trigger set_updated_at_cdm
before update on public.cdm_records
for each row execute function public.set_updated_at();

-- 4) (Tahtmise korral) lubame ainult ühe "final" kirje projekt+code kohta
-- create unique index if not exists uniq_cdm_final_per_code
--   on public.cdm_records (project_id, code)
--   where status = 'final';

-- 5) Palu PostgRESTil skeem uuesti laadida (et 'code' kohe nähtav oleks)
notify pgrst, 'reload schema';
