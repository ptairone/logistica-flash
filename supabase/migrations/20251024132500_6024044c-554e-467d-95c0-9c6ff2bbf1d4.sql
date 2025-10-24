-- Criação de Enums
create type public.app_role as enum ('admin', 'operacional', 'motorista', 'financeiro');

create type public.status_veiculo as enum ('ativo', 'inativo', 'manutencao');

create type public.tipo_veiculo as enum ('caminhao', 'carreta', 'utilitario', 'van', 'outros');

create type public.status_viagem as enum ('planejada', 'em_andamento', 'concluida', 'cancelada');

create type public.status_frete as enum ('aberto', 'em_transito', 'entregue', 'faturado', 'cancelado');

create type public.status_acerto as enum ('aberto', 'fechado', 'pago');

create type public.tipo_movimentacao as enum ('entrada', 'saida', 'ajuste');

create type public.tipo_despesa as enum ('combustivel', 'pedagio', 'diaria', 'manutencao', 'alimentacao', 'outros');

-- Tabela de Perfis
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  cpf text unique,
  telefone text,
  email text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;

-- Tabela de Roles (Papéis)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Função de segurança para verificar papéis
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Função para verificar se é admin
create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(_user_id, 'admin')
$$;

-- Tabela de Motoristas
create table public.motoristas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nome text not null,
  cpf text unique not null,
  cnh text not null,
  validade_cnh date not null,
  telefone text,
  email text,
  comissao_padrao numeric(5,2) default 0,
  status status_veiculo default 'ativo',
  observacoes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.motoristas enable row level security;

-- Tabela de Veículos
create table public.veiculos (
  id uuid primary key default gen_random_uuid(),
  codigo_interno text unique not null,
  placa text unique not null,
  renavam text,
  marca text not null,
  modelo text not null,
  ano integer,
  tipo tipo_veiculo not null,
  capacidade_kg numeric(10,2),
  capacidade_m3 numeric(10,2),
  km_atual integer default 0,
  proxima_manutencao_km integer,
  proxima_manutencao_data date,
  vencimento_ipva date,
  vencimento_licenciamento date,
  vencimento_seguro date,
  status status_veiculo default 'ativo',
  observacoes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.veiculos enable row level security;

-- Tabela de Fretes
create table public.fretes (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  cliente_nome text not null,
  cliente_cnpj_cpf text not null,
  cliente_contato text,
  origem text not null,
  origem_cep text,
  destino text not null,
  destino_cep text,
  data_coleta date,
  data_entrega date,
  produto text,
  tipo_carga text,
  peso numeric(10,2),
  volume numeric(10,2),
  valor_frete numeric(12,2) not null,
  condicao_pagamento text,
  status status_frete default 'aberto',
  numero_fatura text,
  observacoes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.fretes enable row level security;

-- Tabela de Viagens
create table public.viagens (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  veiculo_id uuid references public.veiculos(id) on delete restrict not null,
  motorista_id uuid references public.motoristas(id) on delete restrict not null,
  frete_id uuid references public.fretes(id) on delete set null,
  origem text not null,
  origem_cep text,
  destino text not null,
  destino_cep text,
  data_saida timestamp with time zone,
  data_chegada timestamp with time zone,
  km_estimado numeric(10,2),
  km_percorrido numeric(10,2),
  status status_viagem default 'planejada',
  notas text,
  acerto_id uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.viagens enable row level security;

-- Tabela de Despesas
create table public.despesas (
  id uuid primary key default gen_random_uuid(),
  viagem_id uuid references public.viagens(id) on delete cascade not null,
  tipo tipo_despesa not null,
  valor numeric(12,2) not null,
  data timestamp with time zone not null default now(),
  descricao text,
  reembolsavel boolean default true,
  anexo_url text,
  created_at timestamp with time zone not null default now()
);

alter table public.despesas enable row level security;

-- Tabela de Acertos
create table public.acertos (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  motorista_id uuid references public.motoristas(id) on delete restrict not null,
  periodo_inicio date not null,
  periodo_fim date not null,
  base_comissao numeric(12,2) default 0,
  percentual_comissao numeric(5,2) default 0,
  valor_comissao numeric(12,2) default 0,
  total_reembolsos numeric(12,2) default 0,
  total_adiantamentos numeric(12,2) default 0,
  total_descontos numeric(12,2) default 0,
  total_pagar numeric(12,2) default 0,
  status status_acerto default 'aberto',
  recibo_url text,
  data_pagamento date,
  forma_pagamento text,
  observacoes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.acertos enable row level security;

-- Adicionar foreign key de acerto_id em viagens
alter table public.viagens add constraint fk_viagens_acerto 
  foreign key (acerto_id) references public.acertos(id) on delete set null;

-- Tabela de Itens de Estoque
create table public.itens_estoque (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  descricao text not null,
  categoria text,
  unidade text not null,
  estoque_atual numeric(10,2) default 0,
  estoque_minimo numeric(10,2) default 0,
  custo_medio numeric(12,2) default 0,
  local text,
  fornecedor text,
  observacoes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.itens_estoque enable row level security;

-- Tabela de Movimentações de Estoque
create table public.movimentacoes_estoque (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.itens_estoque(id) on delete restrict not null,
  tipo tipo_movimentacao not null,
  quantidade numeric(10,2) not null,
  custo_unitario numeric(12,2),
  motivo text,
  referencia_viagem_id uuid references public.viagens(id) on delete set null,
  data timestamp with time zone not null default now(),
  usuario_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone not null default now()
);

alter table public.movimentacoes_estoque enable row level security;

-- Tabela de Manutenções
create table public.manutencoes (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid references public.veiculos(id) on delete cascade not null,
  data date not null,
  tipo text not null,
  descricao text,
  km_veiculo integer,
  custo numeric(12,2),
  fornecedor text,
  observacoes text,
  created_at timestamp with time zone not null default now()
);

alter table public.manutencoes enable row level security;

-- Tabela de Documentos/Anexos
create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  tipo_entidade text not null, -- 'veiculo', 'motorista', 'viagem', 'frete'
  entidade_id uuid not null,
  nome text not null,
  tipo_documento text, -- 'CRLV', 'CNH', 'comprovante', etc
  url text not null,
  tamanho bigint,
  mime_type text,
  created_at timestamp with time zone not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

alter table public.documentos enable row level security;

-- Tabela de Logs de Auditoria
create table public.logs_auditoria (
  id uuid primary key default gen_random_uuid(),
  tabela text not null,
  registro_id uuid not null,
  acao text not null, -- 'INSERT', 'UPDATE', 'DELETE'
  dados_anteriores jsonb,
  dados_novos jsonb,
  usuario_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone not null default now()
);

alter table public.logs_auditoria enable row level security;

-- Trigger para atualizar updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_motoristas_updated_at before update on public.motoristas
  for each row execute function public.update_updated_at_column();

create trigger update_veiculos_updated_at before update on public.veiculos
  for each row execute function public.update_updated_at_column();

create trigger update_viagens_updated_at before update on public.viagens
  for each row execute function public.update_updated_at_column();

create trigger update_fretes_updated_at before update on public.fretes
  for each row execute function public.update_updated_at_column();

create trigger update_acertos_updated_at before update on public.acertos
  for each row execute function public.update_updated_at_column();

create trigger update_itens_estoque_updated_at before update on public.itens_estoque
  for each row execute function public.update_updated_at_column();

-- Trigger para criar perfil automaticamente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS Policies para Profiles
create policy "Usuários podem ver seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins podem ver todos os perfis"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

-- RLS Policies para User Roles
create policy "Usuários podem ver seus próprios papéis"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins podem gerenciar papéis"
  on public.user_roles for all
  using (public.is_admin(auth.uid()));

-- RLS Policies para Motoristas
create policy "Motoristas veem seus próprios dados"
  on public.motoristas for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operacional') or public.has_role(auth.uid(), 'financeiro'));

create policy "Admins e Operacionais podem gerenciar motoristas"
  on public.motoristas for all
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operacional'));

-- RLS Policies para Veículos
create policy "Todos autenticados podem ver veículos"
  on public.veiculos for select
  to authenticated
  using (true);

create policy "Admins e Operacionais podem gerenciar veículos"
  on public.veiculos for all
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operacional'));

-- RLS Policies para Fretes
create policy "Usuários autorizados podem ver fretes"
  on public.fretes for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operacional') or public.has_role(auth.uid(), 'financeiro'));

create policy "Admins e Operacionais podem gerenciar fretes"
  on public.fretes for all
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operacional'));

create policy "Financeiro pode atualizar status de faturamento"
  on public.fretes for update
  using (public.has_role(auth.uid(), 'financeiro'));

-- RLS Policies para Viagens
create policy "Motoristas veem suas próprias viagens"
  on public.viagens for select
  using (
    exists (
      select 1 from public.motoristas m
      where m.id = viagens.motorista_id
      and m.user_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'operacional')
    or public.has_role(auth.uid(), 'financeiro')
  );

create policy "Admins e Operacionais podem gerenciar viagens"
  on public.viagens for all
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operacional'));

create policy "Motoristas podem atualizar suas viagens"
  on public.viagens for update
  using (
    exists (
      select 1 from public.motoristas m
      where m.id = viagens.motorista_id
      and m.user_id = auth.uid()
    )
  );

-- RLS Policies para Despesas
create policy "Ver despesas conforme viagem"
  on public.despesas for select
  using (
    exists (
      select 1 from public.viagens v
      join public.motoristas m on m.id = v.motorista_id
      where v.id = despesas.viagem_id
      and (m.user_id = auth.uid() or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operacional') or public.has_role(auth.uid(), 'financeiro'))
    )
  );

create policy "Motoristas podem adicionar despesas em suas viagens"
  on public.despesas for insert
  with check (
    exists (
      select 1 from public.viagens v
      join public.motoristas m on m.id = v.motorista_id
      where v.id = despesas.viagem_id
      and m.user_id = auth.uid()
    )
  );

create policy "Admins e Operacionais podem gerenciar despesas"
  on public.despesas for all
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operacional'));

-- RLS Policies para Acertos
create policy "Motoristas veem seus acertos"
  on public.acertos for select
  using (
    exists (
      select 1 from public.motoristas m
      where m.id = acertos.motorista_id
      and m.user_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'financeiro')
  );

create policy "Admins e Financeiro podem gerenciar acertos"
  on public.acertos for all
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'financeiro'));

-- RLS Policies para Estoque
create policy "Usuários autorizados podem ver estoque"
  on public.itens_estoque for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operacional'));

create policy "Admins e Operacionais podem gerenciar estoque"
  on public.itens_estoque for all
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operacional'));

-- RLS Policies para Movimentações de Estoque
create policy "Usuários autorizados podem ver movimentações"
  on public.movimentacoes_estoque for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operacional'));

create policy "Admins e Operacionais podem criar movimentações"
  on public.movimentacoes_estoque for insert
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operacional'));

-- RLS Policies para Manutenções
create policy "Todos autenticados podem ver manutenções"
  on public.manutencoes for select
  to authenticated
  using (true);

create policy "Admins e Operacionais podem gerenciar manutenções"
  on public.manutencoes for all
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'operacional'));

-- RLS Policies para Documentos
create policy "Ver documentos conforme permissão"
  on public.documentos for select
  to authenticated
  using (true);

create policy "Usuários autorizados podem adicionar documentos"
  on public.documentos for insert
  to authenticated
  with check (true);

create policy "Admins podem gerenciar documentos"
  on public.documentos for all
  using (public.is_admin(auth.uid()));

-- RLS Policies para Logs de Auditoria
create policy "Admins podem ver logs"
  on public.logs_auditoria for select
  using (public.is_admin(auth.uid()));

-- Storage Buckets
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false);

insert into storage.buckets (id, name, public)
values ('comprovantes', 'comprovantes', false);

-- Storage Policies
create policy "Usuários autenticados podem fazer upload de documentos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documentos');

create policy "Usuários autenticados podem ver documentos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documentos');

create policy "Usuários autenticados podem fazer upload de comprovantes"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'comprovantes');

create policy "Usuários autenticados podem ver comprovantes"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'comprovantes');