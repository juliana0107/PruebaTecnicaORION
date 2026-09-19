-- Limpiar (respetando orden de FK)
TRUNCATE work_order_history, work_orders, asset_history, assets, crews, users RESTART IDENTITY CASCADE;

-- Usuarios demo
INSERT INTO users (email, password_hash, name, role) VALUES
  ('supervisor@orion.com', '$2b$10$GtXzr/o4MRdwfKei.LlIN.rR50pA.rOYKDSpird8mwiZYZybVUqCK', 'Supervisor Demo', 'SUPERVISOR'),
  ('coordinador@orion.com', '$2b$10$GtXzr/o4MRdwfKei.LlIN.rR50pA.rOYKDSpird8mwiZYZybVUqCK', 'Coordinador Demo', 'COORDINATOR'),
  ('tecnico@orion.com', '$2b$10$GtXzr/o4MRdwfKei.LlIN.rR50pA.rOYKDSpird8mwiZYZybVUqCK', 'Técnico Demo', 'TECHNICIAN')
ON CONFLICT (email) DO NOTHING;

-- Activos ITS
INSERT INTO assets (code, name, asset_type_id, location_id, status, criticality, installed_at) VALUES
  ('PMV-COR1-001', 'PMV Entrada Corredor 1', 1, 1, 'OPERATIVO', 'ALTA', '2023-05-12'),
  ('PMV-COR1-002', 'PMV Salida Corredor 1', 1, 1, 'EN_MANTENIMIENTO', 'MEDIA', '2023-06-20'),
  ('CCTV-COR1-001', 'CCTV Peaje Norte', 2, 1, 'OPERATIVO', 'CRITICA', '2022-11-05'),
  ('CCTV-COR2-001', 'CCTV Curva Sur', 2, 2, 'FUERA_DE_SERVICIO', 'ALTA', '2023-01-15'),
  ('METEO-COR1-001', 'Estación Meteorológica Km 15', 3, 1, 'OPERATIVO', 'MEDIA', '2023-03-22'),
  ('SENSOR-COR2-001', 'Sensor Tráfico Km 30', 4, 2, 'OPERATIVO', 'BAJA', '2023-08-10'),
  ('SENSOR-COR3-001', 'Sensor Tráfico Km 45', 4, 3, 'OPERATIVO', 'MEDIA', '2023-09-01'),
  ('AFORADOR-COR2-001', 'Aforador Principal Corredor 2', 5, 2, 'EN_MANTENIMIENTO', 'ALTA', '2022-12-01'),
  ('AFORADOR-COR3-001', 'Aforador Secundario Corredor 3', 5, 3, 'OPERATIVO', 'BAJA', '2023-07-14'),
  ('CCTV-COR3-001', 'CCTV Túnel', 2, 3, 'OPERATIVO', 'CRITICA', '2023-02-08');

-- Cuadrillas
INSERT INTO crews (code, name, specialty, zone, leader, status) VALUES
  ('CUA-COR1-001', 'Cuadrilla PMV Corredor 1', 'PMV', 'COR1', 'Juan Pérez', 'DISPONIBLE'),
  ('CUA-COR1-002', 'Cuadrilla CCTV Corredor 1', 'CCTV', 'COR1', 'María Rodríguez', 'ASIGNADA'),
  ('CUA-COR2-001', 'Cuadrilla General Corredor 2', 'GENERAL', 'COR2', 'Carlos Gómez', 'EN_EJECUCION'),
  ('CUA-COR3-001', 'Cuadrilla Sensores Corredor 3', 'SENSORES', 'COR3', 'Ana Martínez', 'DISPONIBLE'),
  ('CUA-COR2-002', 'Cuadrilla Meteo Corredor 2', 'METEO', 'COR2', 'Pedro Sánchez', 'NO_DISPONIBLE');

-- Órdenes de Trabajo
DO $$
DECLARE
  pmv1 UUID; pmv2 UUID; cctv1 UUID; cctv2 UUID; meteo1 UUID; sensor1 UUID; aforador1 UUID;
  crew1 UUID; crew2 UUID; crew3 UUID; crew4 UUID;
BEGIN
  SELECT id INTO pmv1 FROM assets WHERE code = 'PMV-COR1-001';
  SELECT id INTO pmv2 FROM assets WHERE code = 'PMV-COR1-002';
  SELECT id INTO cctv1 FROM assets WHERE code = 'CCTV-COR1-001';
  SELECT id INTO cctv2 FROM assets WHERE code = 'CCTV-COR2-001';
  SELECT id INTO meteo1 FROM assets WHERE code = 'METEO-COR1-001';
  SELECT id INTO sensor1 FROM assets WHERE code = 'SENSOR-COR2-001';
  SELECT id INTO aforador1 FROM assets WHERE code = 'AFORADOR-COR2-001';
  SELECT id INTO crew1 FROM crews WHERE code = 'CUA-COR1-001';
  SELECT id INTO crew2 FROM crews WHERE code = 'CUA-COR1-002';
  SELECT id INTO crew3 FROM crews WHERE code = 'CUA-COR2-001';
  SELECT id INTO crew4 FROM crews WHERE code = 'CUA-COR3-001';

  INSERT INTO work_orders (code, asset_id, crew_id, type, priority, status, description, resolution, cancel_reason) VALUES
    ('OT-PREV-2026-0001', pmv1, crew1, 'PREVENTIVA', 'MEDIA', 'COMPLETADA',
     'Inspección trimestral de PMV', 'Limpieza y calibración realizadas sin novedad', NULL),
    ('OT-CORR-2026-0002', cctv2, crew2, 'CORRECTIVA', 'ALTA', 'COMPLETADA',
     'Reparación de cámara sin señal', 'Reemplazo de conector y limpieza de lente', NULL),
    ('OT-PREV-2026-0003', meteo1, crew3, 'PREVENTIVA', 'MEDIA', 'EN_EJECUCION',
     'Calibración anual de sensores meteorológicos', NULL, NULL),
    ('OT-CORR-2026-0004', aforador1, crew3, 'CORRECTIVA', 'ALTA', 'EN_EJECUCION',
     'Falla en aforador principal', NULL, NULL),
    ('OT-PREV-2026-0005', cctv1, NULL, 'PREVENTIVA', 'BAJA', 'PENDIENTE',
     'Limpieza y verificación de CCTV', NULL, NULL),
    ('OT-PREV-2026-0006', sensor1, NULL, 'PREVENTIVA', 'MEDIA', 'PENDIENTE',
     'Verificación de sensor de tráfico', NULL, NULL),
    ('OT-CORR-2026-0007', pmv2, crew1, 'CORRECTIVA', 'ALTA', 'ASIGNADA',
     'Panel con píxeles defectuosos', NULL, NULL),
    ('OT-PREV-2026-0008', cctv1, crew2, 'PREVENTIVA', 'BAJA', 'ASIGNADA',
     'Inspección visual de CCTV', NULL, NULL),
    ('OT-PREV-2026-0009', pmv1, crew1, 'PREVENTIVA', 'MEDIA', 'PAUSADA',
     'Actualización de firmware', NULL, NULL),
    ('OT-CORR-2026-0010', cctv2, NULL, 'CORRECTIVA', 'CRITICA', 'CANCELADA',
     'Cámara destruida por accidente vial', NULL, 'Equipo fuera de servicio permanente');
END $$;

-- Historial de ejemplo para algunos activos
INSERT INTO asset_history (asset_id, change_type, description, previous_value, new_value, changed_by)
SELECT id, 'CREATED', 'Activo creado', NULL, code, 'system' FROM assets LIMIT 5;

-- Historial de ejemplo para algunas OT
INSERT INTO work_order_history (work_order_id, change_type, description, previous_value, new_value, changed_by)
SELECT id, 'CREATED', 'OT creada', NULL, code, 'system' FROM work_orders LIMIT 5;