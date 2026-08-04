export function CampoError({ id, mensaje }) { return mensaje ? <span id={id} className="campo-error">{mensaje}</span> : null; }
