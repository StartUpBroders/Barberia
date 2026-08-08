package com.barberiamimi.gestioncitas.servicio;

import org.springframework.stereotype.Service;

@Service
public class ServicioProteccionReservas {
    private final ServicioLimiteIntentosReserva limiteIntentos;

    public ServicioProteccionReservas(ServicioLimiteIntentosReserva limiteIntentos) {
        this.limiteIntentos = limiteIntentos;
    }

    public void validarIntento(String slug, String direccionIp) {
        limiteIntentos.registrar(slug, direccionIp);
    }
}
