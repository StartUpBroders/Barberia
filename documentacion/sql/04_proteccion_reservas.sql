BEGIN;

CREATE TABLE IF NOT EXISTS intentos_reserva (
 id BIGSERIAL PRIMARY KEY,
 barberia_id BIGINT NOT NULL REFERENCES barberias(id),
 huella_origen VARCHAR(64) NOT NULL,
 fecha_intento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_intento_reserva_busqueda
 ON intentos_reserva(barberia_id, huella_origen, fecha_intento);

COMMIT;
