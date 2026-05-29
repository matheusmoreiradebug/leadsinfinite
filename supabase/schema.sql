-- ═══════════════════════════════════════════════════════════════
--  Infinite Móveis — Lead Tracking Schema
-- ═══════════════════════════════════════════════════════════════

-- Sellers (vendedores)
create table if not exists sellers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,        -- formato: 5511999999999
  active      boolean default true,
  leads_count integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Rotation state (linha única — índice atômico do rodízio)
create table if not exists rotation_state (
  id            integer primary key default 1,
  current_index integer default 0,
  updated_at    timestamptz default now(),
  constraint single_row check (id = 1)
);
insert into rotation_state (id, current_index) values (1, 0)
  on conflict (id) do nothing;

-- Leads
create table if not exists leads (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  seller_id      uuid references sellers(id) on delete set null,
  seller_name    text,
  seller_phone   text,
  customer_name  text not null,
  customer_phone text not null,
  city           text,
  state          text,
  message        text,
  source         text default 'form',   -- 'form' | 'cta_btn' | 'float'
  kit            text,                   -- 'Kit Loja 01' | 'Kit Loja 02' | null
  utm_source     text,
  utm_campaign   text,
  utm_medium     text,
  utm_content    text,
  utm_term       text,
  device         text,                   -- 'mobile' | 'tablet' | 'desktop'
  landing_page   text,
  ip_address     text,
  user_agent     text
);

-- Performance indexes
create index if not exists leads_created_at_idx  on leads(created_at desc);
create index if not exists leads_seller_id_idx   on leads(seller_id);
create index if not exists leads_utm_source_idx  on leads(utm_source);
create index if not exists leads_source_idx      on leads(source);

-- ─── Função atômica de rodízio (sem race condition) ─────────────
create or replace function get_next_seller()
returns table(sid uuid, sname text, sphone text)
language plpgsql
security definer
as $$
declare
  v_idx    integer;
  v_count  integer;
  v_seller sellers%rowtype;
begin
  -- Lock exclusivo para evitar race conditions em múltiplas requisições simultâneas
  select current_index into v_idx
    from rotation_state where id = 1 for update;

  select count(*) into v_count from sellers where active = true;

  if v_count = 0 then
    raise exception 'Nenhum vendedor ativo disponível';
  end if;

  -- Seleciona o vendedor na posição atual (ordenado por data de criação)
  select * into v_seller
    from sellers
    where active = true
    order by created_at
    limit 1 offset (v_idx % v_count);

  -- Avança o índice
  update rotation_state
    set current_index = (v_idx + 1) % v_count,
        updated_at    = now()
    where id = 1;

  return query select v_seller.id, v_seller.name, v_seller.phone;
end;
$$;

-- ─── RLS ────────────────────────────────────────────────────────
alter table sellers        enable row level security;
alter table rotation_state enable row level security;
alter table leads          enable row level security;

-- API routes usam service_role key (bypassa RLS automaticamente)
-- Dashboard usa anon key com políticas permissivas (ferramenta interna)
create policy "anon_read_sellers" on sellers
  for select using (true);

create policy "anon_read_leads" on leads
  for select using (true);

-- ─── Seed: 5 vendedores iniciais ────────────────────────────────
insert into sellers (name, phone) values
  ('Especialista 1', '5511942719647'),
  ('Especialista 2', '5511986046078'),
  ('Especialista 3', '5511919477218'),
  ('Especialista 4', '5511996063975'),
  ('Especialista 5', '5511985953197')
on conflict do nothing;
