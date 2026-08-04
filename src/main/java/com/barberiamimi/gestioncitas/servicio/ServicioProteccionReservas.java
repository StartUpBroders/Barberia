package com.barberiamimi.gestioncitas.servicio;

import org.springframework.stereotype.Service;

@Service
public class ServicioProteccionReservas {
    private final ServicioTurnstile turnstile;
    private final ServicioLimiteIntentosReserva limiteIntentos;

    public ServicioProteccionReservas(ServicioTurnstile turnstile, ServicioLimiteIntentosReserva limiteIntentos) {
        this.turnstile = turnstile;
        this.limiteIntentos = limiteIntentos;
    }

    public void validarIntento(String slug, String tokenTurnstile, String direccionIp) {
        limiteIntentos.registrar(slug, direccionIp);
        turnstile.validar(tokenTurnstile, direccionIp);
    }
}
