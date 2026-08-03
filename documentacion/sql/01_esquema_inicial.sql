BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE barberias (
 id BIGSERIAL PRIMARY KEY, nombre VARCHAR(120) NOT NULL, slug VARCHAR(80) NOT NULL UNIQUE,
 telefono VARCHAR(20), correo VARCHAR(150), direccion VARCHAR(250), activa BOOLEAN NOT NULL DEFAULT TRUE,
 fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT ck_barberia_slug CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE TABLE profesionales (
 id BIGSERIAL PRIMARY KEY, barberia_id BIGINT NOT NULL REFERENCES barberias(id), nombre VARCHAR(100) NOT NULL,
 alias VARCHAR(80), activo BOOLEAN NOT NULL DEFAULT TRUE, fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT uq_profesional_alias_barberia UNIQUE (barberia_id, alias)
);

CREATE TABLE servicios (
 id BIGSERIAL PRIMARY KEY, barberia_id BIGINT NOT NULL REFERENCES barberias(id), nombre VARCHAR(120) NOT NULL,
 descripcion VARCHAR(600), precio NUMERIC(10,2) NOT NULL, duracion_minutos INTEGER NOT NULL,
 activo BOOLEAN NOT NULL DEFAULT TRUE, fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT uq_servicio_nombre_barberia UNIQUE (barberia_id, nombre),
 CONSTRAINT ck_servicio_precio CHECK (precio >= 0), CONSTRAINT ck_servicio_duracion CHECK (duracion_minutos > 0)
);

CREATE TABLE horarios_trabajo (
 id BIGSERIAL PRIMARY KEY, barberia_id BIGINT NOT NULL REFERENCES barberias(id), profesional_id BIGINT NOT NULL REFERENCES profesionales(id),
 dia_semana VARCHAR(12) NOT NULL, hora_inicio TIME NOT NULL, hora_fin TIME NOT NULL, activo BOOLEAN NOT NULL DEFAULT TRUE,
 fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT ck_horario_dia CHECK (dia_semana IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')),
 CONSTRAINT ck_horario_orden CHECK (hora_fin > hora_inicio)
);

CREATE TABLE dias_bloqueados (
 id BIGSERIAL PRIMARY KEY, barberia_id BIGINT NOT NULL REFERENCES barberias(id), profesional_id BIGINT NOT NULL REFERENCES profesionales(id),
 fecha DATE NOT NULL, hora_inicio TIME, hora_fin TIME, motivo VARCHAR(250), fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT ck_bloqueo_franja CHECK ((hora_inicio IS NULL AND hora_fin IS NULL) OR (hora_inicio IS NOT NULL AND hora_fin > hora_inicio))
);

CREATE TABLE citas (
 id BIGSERIAL PRIMARY KEY, barberia_id BIGINT NOT NULL REFERENCES barberias(id), profesional_id BIGINT NOT NULL REFERENCES profesionales(id),
 servicio_id BIGINT NOT NULL REFERENCES servicios(id), nombre_cliente VARCHAR(100) NOT NULL, telefono_cliente VARCHAR(20) NOT NULL,
 correo_cliente VARCHAR(150), fecha_inicio TIMESTAMP NOT NULL, fecha_fin TIMESTAMP NOT NULL, nota_cliente VARCHAR(1000),
 codigo_cancelacion_hmac VARCHAR(64), estado VARCHAR(30) NOT NULL, cancelada_por VARCHAR(12), motivo_cancelacion VARCHAR(500),
 fecha_cancelacion TIMESTAMP, nombre_servicio_reservado VARCHAR(120) NOT NULL, precio_servicio_reservado NUMERIC(10,2) NOT NULL,
 duracion_servicio_minutos_reservada INTEGER NOT NULL, clave_idempotencia VARCHAR(100) NOT NULL, huella_solicitud VARCHAR(64) NOT NULL,
 anonimizada BOOLEAN NOT NULL DEFAULT FALSE, fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT uq_cita_idempotencia_barberia UNIQUE (barberia_id, clave_idempotencia),
 CONSTRAINT ck_cita_fechas CHECK (fecha_fin > fecha_inicio),
 CONSTRAINT ck_cita_estado CHECK (estado IN ('RESERVADA','CONFIRMADA','COMPLETADA','CANCELADA_POR_CLIENTE','CANCELADA_POR_BARBERIA','NO_PRESENTADO')),
 CONSTRAINT ck_cita_cancelada_por CHECK (cancelada_por IS NULL OR cancelada_por IN ('CLIENTE','BARBERIA'))
);

ALTER TABLE citas ADD CONSTRAINT citas_profesional_sin_solapamiento
 EXCLUDE USING gist (profesional_id WITH =, tsrange(fecha_inicio, fecha_fin, '[)') WITH &&)
 WHERE (estado IN ('RESERVADA','CONFIRMADA'));

CREATE TABLE usuarios_administracion (
 id BIGSERIAL PRIMARY KEY, barberia_id BIGINT NOT NULL REFERENCES barberias(id), profesional_id BIGINT REFERENCES profesionales(id),
 nombre_usuario VARCHAR(80) NOT NULL UNIQUE, contrasena_hash VARCHAR(100) NOT NULL, rol VARCHAR(20) NOT NULL,
 activo BOOLEAN NOT NULL DEFAULT TRUE, intentos_fallidos INTEGER NOT NULL DEFAULT 0, fecha_bloqueo TIMESTAMP,
 fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT ck_usuario_rol CHECK (rol IN ('PROPIETARIO','BARBERO'))
);

CREATE TABLE notificaciones (
 id BIGSERIAL PRIMARY KEY, barberia_id BIGINT NOT NULL REFERENCES barberias(id), profesional_id BIGINT REFERENCES profesionales(id),
 cita_id BIGINT REFERENCES citas(id), tipo VARCHAR(30) NOT NULL, titulo VARCHAR(150) NOT NULL, mensaje VARCHAR(1000) NOT NULL,
 leida BOOLEAN NOT NULL DEFAULT FALSE, fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, fecha_lectura TIMESTAMP,
 CONSTRAINT ck_notificacion_tipo CHECK (tipo IN ('CITA_CANCELADA','CITA_CREADA','SISTEMA'))
);

CREATE TABLE intentos_cancelacion (
 id BIGSERIAL PRIMARY KEY, barberia_id BIGINT NOT NULL REFERENCES barberias(id), huella_origen VARCHAR(64) NOT NULL,
 fecha_intento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, exitoso BOOLEAN NOT NULL
);

CREATE TABLE auditorias_administrativas (
 id BIGSERIAL PRIMARY KEY, barberia_id BIGINT NOT NULL REFERENCES barberias(id), usuario_id BIGINT NOT NULL REFERENCES usuarios_administracion(id),
 accion VARCHAR(80) NOT NULL, tipo_recurso VARCHAR(80) NOT NULL, recurso_id BIGINT, fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Las claves compuestas impiden también desde PostgreSQL mezclar recursos de barberías distintas.
ALTER TABLE profesionales ADD CONSTRAINT uq_profesional_id_barberia UNIQUE (id, barberia_id);
ALTER TABLE servicios ADD CONSTRAINT uq_servicio_id_barberia UNIQUE (id, barberia_id);
ALTER TABLE usuarios_administracion ADD CONSTRAINT uq_usuario_id_barberia UNIQUE (id, barberia_id);
ALTER TABLE citas ADD CONSTRAINT uq_cita_id_barberia UNIQUE (id, barberia_id);
ALTER TABLE citas ADD CONSTRAINT fk_cita_profesional_barberia FOREIGN KEY (profesional_id,barberia_id) REFERENCES profesionales(id,barberia_id);
ALTER TABLE citas ADD CONSTRAINT fk_cita_servicio_barberia FOREIGN KEY (servicio_id,barberia_id) REFERENCES servicios(id,barberia_id);
ALTER TABLE horarios_trabajo ADD CONSTRAINT fk_horario_profesional_barberia FOREIGN KEY (profesional_id,barberia_id) REFERENCES profesionales(id,barberia_id);
ALTER TABLE dias_bloqueados ADD CONSTRAINT fk_bloqueo_profesional_barberia FOREIGN KEY (profesional_id,barberia_id) REFERENCES profesionales(id,barberia_id);
ALTER TABLE usuarios_administracion ADD CONSTRAINT fk_usuario_profesional_barberia FOREIGN KEY (profesional_id,barberia_id) REFERENCES profesionales(id,barberia_id);
ALTER TABLE notificaciones ADD CONSTRAINT fk_notificacion_profesional_barberia FOREIGN KEY (profesional_id,barberia_id) REFERENCES profesionales(id,barberia_id);
ALTER TABLE notificaciones ADD CONSTRAINT fk_notificacion_cita_barberia FOREIGN KEY (cita_id,barberia_id) REFERENCES citas(id,barberia_id);
ALTER TABLE auditorias_administrativas ADD CONSTRAINT fk_auditoria_usuario_barberia FOREIGN KEY (usuario_id,barberia_id) REFERENCES usuarios_administracion(id,barberia_id);

CREATE INDEX idx_profesionales_barberia ON profesionales(barberia_id, activo);
CREATE INDEX idx_servicios_barberia ON servicios(barberia_id, activo);
CREATE INDEX idx_horarios_busqueda ON horarios_trabajo(barberia_id, profesional_id, dia_semana, activo);
CREATE INDEX idx_dias_bloqueados_busqueda ON dias_bloqueados(barberia_id, profesional_id, fecha);
CREATE INDEX idx_citas_barberia_fecha ON citas(barberia_id, fecha_inicio);
CREATE INDEX idx_citas_profesional_fecha ON citas(profesional_id, fecha_inicio);
CREATE INDEX idx_citas_telefono ON citas(barberia_id, telefono_cliente) WHERE anonimizada = FALSE;
CREATE INDEX idx_notificaciones_no_leidas ON notificaciones(barberia_id, leida, fecha_creacion DESC);
CREATE INDEX idx_intento_cancelacion_busqueda ON intentos_cancelacion(barberia_id, huella_origen, fecha_intento);

INSERT INTO barberias(nombre,slug,telefono,correo,direccion) VALUES ('Barbería Mimi','barberia-mimi','600000000','mimi@example.invalid','Dirección de desarrollo');
INSERT INTO profesionales(barberia_id,nombre,alias) SELECT id,'Mimi','mimi' FROM barberias WHERE slug='barberia-mimi';
INSERT INTO servicios(barberia_id,nombre,descripcion,precio,duracion_minutos)
 SELECT id,'Corte','Corte de cabello',15.00,30 FROM barberias WHERE slug='barberia-mimi'
 UNION ALL SELECT id,'Corte y barba','Corte de cabello y arreglo de barba',18.00,45 FROM barberias WHERE slug='barberia-mimi'
 UNION ALL SELECT id,'Tinte','Servicio de tinte',30.00,60 FROM barberias WHERE slug='barberia-mimi';
INSERT INTO horarios_trabajo(barberia_id,profesional_id,dia_semana,hora_inicio,hora_fin)
 SELECT b.id,p.id,d.dia,'09:00','14:00' FROM barberias b JOIN profesionales p ON p.barberia_id=b.id
 CROSS JOIN (VALUES ('MONDAY'),('TUESDAY'),('WEDNESDAY'),('THURSDAY'),('FRIDAY'),('SATURDAY')) d(dia) WHERE b.slug='barberia-mimi';
INSERT INTO horarios_trabajo(barberia_id,profesional_id,dia_semana,hora_inicio,hora_fin)
 SELECT b.id,p.id,d.dia,'16:00','20:00' FROM barberias b JOIN profesionales p ON p.barberia_id=b.id
 CROSS JOIN (VALUES ('MONDAY'),('TUESDAY'),('WEDNESDAY'),('THURSDAY'),('FRIDAY')) d(dia) WHERE b.slug='barberia-mimi';
INSERT INTO usuarios_administracion(barberia_id,profesional_id,nombre_usuario,contrasena_hash,rol)
 SELECT b.id,p.id,'mimi',crypt('mimi123',gen_salt('bf',12)),'PROPIETARIO' FROM barberias b JOIN profesionales p ON p.barberia_id=b.id WHERE b.slug='barberia-mimi';

COMMIT;
