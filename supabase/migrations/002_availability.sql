-- Adiciona buffer_minutes à tabela de barbeiros
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS buffer_minutes integer DEFAULT 15 NOT NULL;

-- ─── Disponibilidade semanal ───────────────────────────────────────────────
CREATE TABLE barber_availability (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  barber_id    uuid REFERENCES barbers ON DELETE CASCADE NOT NULL,
  day_of_week  integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom, 1=Seg...6=Sab
  start_time   time NOT NULL,
  end_time     time NOT NULL,
  active       boolean DEFAULT true NOT NULL,
  UNIQUE (barber_id, day_of_week)
);

ALTER TABLE barber_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Disponibilidade pública"          ON barber_availability FOR SELECT USING (true);
CREATE POLICY "Barbeiro gerencia disponibilidade" ON barber_availability FOR ALL   USING (auth.uid() = barber_id);

-- ─── Datas bloqueadas ─────────────────────────────────────────────────────
CREATE TABLE barber_blocked_dates (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  barber_id    uuid REFERENCES barbers ON DELETE CASCADE NOT NULL,
  blocked_date date NOT NULL,
  reason       text,
  UNIQUE (barber_id, blocked_date)
);

ALTER TABLE barber_blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Datas bloqueadas públicas"          ON barber_blocked_dates FOR SELECT USING (true);
CREATE POLICY "Barbeiro gerencia datas bloqueadas" ON barber_blocked_dates FOR ALL   USING (auth.uid() = barber_id);

-- ─── Durações de serviço por barbeiro ────────────────────────────────────
CREATE TABLE barber_service_durations (
  id               uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  barber_id        uuid REFERENCES barbers ON DELETE CASCADE NOT NULL,
  service_type     text NOT NULL CHECK (service_type IN ('haircut','beard','combo','treatment')),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  UNIQUE (barber_id, service_type)
);

ALTER TABLE barber_service_durations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Durações públicas"          ON barber_service_durations FOR SELECT USING (true);
CREATE POLICY "Barbeiro gerencia durações" ON barber_service_durations FOR ALL   USING (auth.uid() = barber_id);

-- ─── Índices ──────────────────────────────────────────────────────────────
CREATE INDEX idx_barber_availability_barber       ON barber_availability(barber_id);
CREATE INDEX idx_barber_availability_day          ON barber_availability(barber_id, day_of_week);
CREATE INDEX idx_barber_blocked_dates_barber      ON barber_blocked_dates(barber_id);
CREATE INDEX idx_barber_blocked_dates_date        ON barber_blocked_dates(barber_id, blocked_date);
CREATE INDEX idx_barber_service_durations_barber  ON barber_service_durations(barber_id);
