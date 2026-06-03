-- Habilitar extensão uuid
create extension if not exists "uuid-ossp";

-- Perfis de usuário (complementa auth.users)
create table profiles (
  id         uuid references auth.users on delete cascade primary key,
  type       text not null check (type in ('client', 'barber', 'admin')),
  full_name  text not null,
  cpf        text,
  phone      text,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table profiles enable row level security;

create policy "Perfil visível publicamente" on profiles for select using (true);
create policy "Usuário edita próprio perfil" on profiles for update using (auth.uid() = id);
create policy "Inserção via registro" on profiles for insert with check (auth.uid() = id);

-- Perfis de barbeiros
create table barbers (
  id                 uuid references profiles on delete cascade primary key,
  bio                text,
  instagram_url      text,
  document_url       text,
  selfie_url         text,
  status             text not null default 'pending' check (status in ('pending', 'verified', 'suspended', 'banned')),
  rating_avg         decimal(3,1) default 0 not null,
  rating_count       integer default 0 not null,
  service_radius_km  integer default 10 not null check (service_radius_km between 2 and 30),
  base_address       text,
  base_lat           decimal(10,7),
  base_lng           decimal(10,7),
  stripe_account_id  text,
  warnings_count     integer default 0 not null,
  created_at         timestamptz default now() not null
);

alter table barbers enable row level security;

create policy "Barbeiros verificados são públicos" on barbers for select using (true);
create policy "Barbeiro edita próprio perfil" on barbers for update using (auth.uid() = id);
create policy "Inserção via registro" on barbers for insert with check (auth.uid() = id);

-- Serviços do barbeiro
create table barber_services (
  id               uuid default uuid_generate_v4() primary key,
  barber_id        uuid references barbers on delete cascade not null,
  service_type     text not null check (service_type in ('haircut', 'beard', 'combo', 'treatment')),
  name             text not null,
  price            decimal(8,2) not null,
  duration_minutes integer not null,
  active           boolean default true not null
);

alter table barber_services enable row level security;

create policy "Serviços são públicos" on barber_services for select using (true);
create policy "Barbeiro gerencia próprios serviços" on barber_services for all using (auth.uid() = barber_id);

-- Clientes
create table clients (
  id                 uuid references profiles on delete cascade primary key,
  default_address    text,
  default_lat        decimal(10,7),
  default_lng        decimal(10,7),
  stripe_customer_id text
);

alter table clients enable row level security;

create policy "Cliente vê próprios dados" on clients for select using (auth.uid() = id);
create policy "Cliente edita próprios dados" on clients for update using (auth.uid() = id);
create policy "Inserção via registro" on clients for insert with check (auth.uid() = id);

-- Agendamentos
create table bookings (
  id                       uuid default uuid_generate_v4() primary key,
  client_id                uuid references clients not null,
  barber_id                uuid references barbers not null,
  service_id               uuid references barber_services not null,
  status                   text not null default 'pending'
    check (status in ('pending','accepted','rejected','completed','cancelled','no_show_client','no_show_barber')),
  address                  text not null,
  lat                      decimal(10,7) not null,
  lng                      decimal(10,7) not null,
  scheduled_at             timestamptz,
  distance_km              decimal(6,2) not null,
  service_price            decimal(8,2) not null,
  travel_fee               decimal(8,2) not null default 0,
  total_amount             decimal(8,2) not null,
  platform_fee             decimal(8,2) not null,
  barber_payout            decimal(8,2) not null,
  stripe_payment_intent_id text,
  check_in_at              timestamptz,
  check_out_at             timestamptz,
  created_at               timestamptz default now() not null
);

alter table bookings enable row level security;

create policy "Cliente vê próprios agendamentos" on bookings for select using (auth.uid() = client_id);
create policy "Barbeiro vê próprios agendamentos" on bookings for select using (auth.uid() = barber_id);
create policy "Cliente cria agendamento" on bookings for insert with check (auth.uid() = client_id);
create policy "Participantes atualizam agendamento" on bookings for update using (auth.uid() in (client_id, barber_id));

-- Horários sugeridos
create table booking_time_suggestions (
  id          uuid default uuid_generate_v4() primary key,
  booking_id  uuid references bookings on delete cascade not null,
  suggested_at timestamptz not null,
  proposed_by text not null check (proposed_by in ('client', 'barber'))
);

alter table booking_time_suggestions enable row level security;

create policy "Participantes veem sugestões" on booking_time_suggestions for select
  using (
    auth.uid() in (
      select client_id from bookings where id = booking_id
      union
      select barber_id from bookings where id = booking_id
    )
  );

create policy "Participantes inserem sugestões" on booking_time_suggestions for insert
  with check (
    auth.uid() in (
      select client_id from bookings where id = booking_id
      union
      select barber_id from bookings where id = booking_id
    )
  );

-- Avaliações
create table reviews (
  id                  uuid default uuid_generate_v4() primary key,
  booking_id          uuid references bookings on delete cascade not null,
  reviewer_id         uuid references profiles not null,
  reviewed_id         uuid references profiles not null,
  rating              integer not null check (rating between 1 and 5),
  comment             text,
  portfolio_photo_url text,
  created_at          timestamptz default now() not null,
  unique (booking_id, reviewer_id)
);

alter table reviews enable row level security;

create policy "Avaliações são públicas" on reviews for select using (true);
create policy "Participante cria avaliação" on reviews for insert
  with check (
    auth.uid() = reviewer_id
    and auth.uid() in (
      select client_id from bookings where id = booking_id
      union
      select barber_id from bookings where id = booking_id
    )
  );

-- Mensagens do chat
create table messages (
  id          uuid default uuid_generate_v4() primary key,
  booking_id  uuid references bookings on delete cascade not null,
  sender_id   uuid references profiles not null,
  content     text not null,
  blocked     boolean default false not null,
  created_at  timestamptz default now() not null
);

alter table messages enable row level security;

create policy "Participantes veem mensagens" on messages for select
  using (
    auth.uid() in (
      select client_id from bookings where id = booking_id
      union
      select barber_id from bookings where id = booking_id
    )
  );

create policy "Participante envia mensagem" on messages for insert
  with check (
    auth.uid() = sender_id
    and auth.uid() in (
      select client_id from bookings where id = booking_id
      union
      select barber_id from bookings where id = booking_id
    )
  );

-- Flags de bypass
create table bypass_flags (
  id          uuid default uuid_generate_v4() primary key,
  booking_id  uuid references bookings on delete cascade not null,
  reason      text not null,
  reviewed    boolean default false not null,
  created_at  timestamptz default now() not null
);

alter table bypass_flags enable row level security;

-- Apenas admins veem flags (service_role bypassa RLS)
create policy "Somente service_role acessa flags" on bypass_flags for all using (false);

-- Função para incrementar advertências do barbeiro
create or replace function increment_barber_warnings(barber_id uuid)
returns void language sql security definer as $$
  update barbers set warnings_count = warnings_count + 1 where id = barber_id;
$$;

-- Índices para performance
create index idx_bookings_client on bookings(client_id);
create index idx_bookings_barber on bookings(barber_id);
create index idx_bookings_status on bookings(status);
create index idx_barbers_status_rating on barbers(status, rating_avg desc);
create index idx_messages_booking on messages(booking_id, created_at);
create index idx_reviews_reviewed on reviews(reviewed_id);
create index idx_bypass_flags_reviewed on bypass_flags(reviewed) where not reviewed;
