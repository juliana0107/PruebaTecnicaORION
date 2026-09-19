CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS asset_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  asset_type_id INTEGER NOT NULL REFERENCES asset_types(id),
  location_id INTEGER REFERENCES locations(id),
  status VARCHAR(30) NOT NULL DEFAULT 'OPERATIVO',
  criticality VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  installed_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type_id);
CREATE INDEX IF NOT EXISTS idx_assets_location ON assets(location_id);

CREATE TABLE IF NOT EXISTS asset_history (
  id SERIAL PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  change_type VARCHAR(50) NOT NULL,
  description TEXT,
  previous_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(100),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO asset_types (code, name) VALUES
  ('PMV', 'Panel de Mensajería Variable'),
  ('CCTV', 'Cámara CCTV'),
  ('METEO', 'Estación Meteorológica'),
  ('SENSOR', 'Sensor de Tráfico'),
  ('AFORADOR', 'Aforador')
ON CONFLICT (code) DO NOTHING;

INSERT INTO locations (code, name) VALUES
  ('COR1', 'Corredor 1'),
  ('COR2', 'Corredor 2'),
  ('COR3', 'Corredor 3')
ON CONFLICT (code) DO NOTHING;