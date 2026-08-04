package com.barberiamimi.gestioncitas.excepcion;

import org.springframework.http.HttpStatus;

public class LimiteCitasFuturasExcepcion extends ExcepcionApi {
    public LimiteCitasFuturasExcepcion() {
        super("LIMITE_CITAS_FUTURAS", "Este teléfono ya tiene el máximo de citas futuras permitidas.", HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
