export function mensajeError(error) { return error?.mensaje || 'Se ha producido un error inesperado.'; }
export function erroresPorCampo(error) {
  return (error?.detalles || []).reduce((resultado, detalle) => {
    const posicion = detalle.indexOf(':');
    if (posicion > 0) resultado[detalle.slice(0, posicion)] = detalle.slice(posicion + 1).trim();
    return resultado;
  }, {});
}
