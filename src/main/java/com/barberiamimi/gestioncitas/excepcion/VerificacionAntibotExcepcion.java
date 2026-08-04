package com.barberiamimi.gestioncitas.excepcion;

import org.springframework.http.HttpStatus;

public class VerificacionAntibotExcepcion extends ExcepcionApi {
    public VerificacionAntibotExcepcion() {
        super("VERIFICACION_ANTIBOT_FALLIDA", "No se ha podido verificar que la reserva sea legítima. Recarga la página e inténtalo de nuevo.", HttpStatus.FORBIDDEN);
    }
}
