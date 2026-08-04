BEGIN;

ALTER TABLE barberias ADD COLUMN IF NOT EXISTS intervalo_minutos INTEGER NOT NULL DEFAULT 30;
ALTER TABLE barberias ADD COLUMN IF NOT EXISTS dias_antelacion_reserva INTEGER NOT NULL DEFAULT 30;

DO $$ BEGIN
 ALTER TABLE barberias ADD CONSTRAINT ck_barberia_intervalo CHECK (intervalo_minutos BETWEEN 5 AND 180);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
 ALTER TABLE barberias ADD CONSTRAINT ck_barberia_antelacion CHECK (dias_antelacion_reserva BETWEEN 1 AND 365);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS dias_trabajo_especial (
 id BIGSERIAL PRIMARY KEY,
 barberia_id BIGINT NOT NULL REFERENCES barberias(id),
 profesional_id BIGINT NOT NULL REFERENCES profesionales(id),
 fecha DATE NOT NULL,
 hora_inicio TIME NOT NULL,
 hora_fin TIME NOT NULL,
 fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT ck_trabajo_especial_orden CHECK (hora_fin > hora_inicio)
);

CREATE INDEX IF NOT EXISTS ix_trabajo_especial_fecha ON dias_trabajo_especial(barberia_id,profesional_id,fecha);

-- Corrige únicamente el sábado creado por los datos de demostración antiguos.
-- Los sábados personalizados con otro horario no se modifican.
DELETE FROM horarios_trabajo h
USING barberias b, profesionales p
WHERE h.barberia_id=b.id AND h.profesional_id=p.id AND p.barberia_id=b.id
  AND b.slug='barberia-mimi' AND p.alias='mimi' AND h.dia_semana='SATURDAY'
  AND h.hora_inicio=TIME '09:00' AND h.hora_fin=TIME '14:00';

WITH repetidos AS (
 SELECT id, ROW_NUMBER() OVER (PARTITION BY barberia_id,profesional_id,dia_semana,hora_inicio,hora_fin ORDER BY id) AS posicion
 FROM horarios_trabajo
)
DELETE FROM horarios_trabajo h USING repetidos r WHERE h.id=r.id AND r.posicion>1;

CREATE UNIQUE INDEX IF NOT EXISTS ux_horario_tramo ON horarios_trabajo(barberia_id, profesional_id, dia_semana, hora_inicio, hora_fin);

COMMIT;
