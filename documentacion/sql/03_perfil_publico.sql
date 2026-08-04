BEGIN;

ALTER TABLE barberias ADD COLUMN IF NOT EXISTS instagram VARCHAR(120);
ALTER TABLE barberias ADD COLUMN IF NOT EXISTS url_google_maps VARCHAR(1000);
ALTER TABLE barberias ADD COLUMN IF NOT EXISTS mostrar_ubicacion BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE barberias
SET direccion = 'C. Pastores, 1A, 41130 La Puebla del Río, Sevilla',
    url_google_maps = 'https://www.google.com/maps/place/C.+Pastores,+1A,+41130+La+Puebla+del+R%C3%ADo,+Sevilla/@37.2652564,-6.0651401,19z',
    mostrar_ubicacion = TRUE
WHERE slug = 'barberia-mimi'
  AND (direccion IS NULL OR direccion = '' OR direccion = 'Dirección de desarrollo');

COMMIT;
