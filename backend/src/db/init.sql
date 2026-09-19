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

CREATE TABLE IF NOT EXISTS crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  specialty VARCHAR(30) NOT NULL,
  zone VARCHAR(50) NOT NULL,
  leader VARCHAR(150) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  asset_id UUID NOT NULL REFERENCES assets(id),
  crew_id UUID REFERENCES crews(id),
  type VARCHAR(20) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  description TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  resolution TEXT,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wo_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_wo_asset ON work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_wo_priority ON work_orders(priority);

CREATE TABLE IF NOT EXISTS work_order_history (
  id SERIAL PRIMARY KEY,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
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