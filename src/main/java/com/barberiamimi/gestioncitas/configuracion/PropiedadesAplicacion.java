package com.barberiamimi.gestioncitas.configuracion;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@ConfigurationProperties(prefix = "aplicacion")
public class PropiedadesAplicacion {
    private final Cancelacion cancelacion = new Cancelacion();
    private final Autenticacion autenticacion = new Autenticacion();
    private final Privacidad privacidad = new Privacidad();
    private final Cors cors = new Cors();
    private final ReservasPublicas reservasPublicas = new ReservasPublicas();
    public Cancelacion getCancelacion() { return cancelacion; }
    public Autenticacion getAutenticacion() { return autenticacion; }
    public Privacidad getPrivacidad() { return privacidad; }
    public Cors getCors() { return cors; }
    public ReservasPublicas getReservasPublicas() { return reservasPublicas; }

    public static class Cancelacion {
        private int maximoIntentos = 5;
        private int ventanaMinutos = 15;
        private int bloqueoMinutos = 15;
        private int horasLimite = 24;
        private String secretoHmac;
        public int getMaximoIntentos() { return maximoIntentos; }
        public void setMaximoIntentos(int valor) { maximoIntentos = valor; }
        public int getVentanaMinutos() { return ventanaMinutos; }
        public void setVentanaMinutos(int valor) { ventanaMinutos = valor; }
        public int getBloqueoMinutos() { return bloqueoMinutos; }
        public void setBloqueoMinutos(int valor) { bloqueoMinutos = valor; }
        public int getHorasLimite() { return horasLimite; }
        public void setHorasLimite(int valor) { horasLimite = valor; }
        public String getSecretoHmac() { return secretoHmac; }
        public void setSecretoHmac(String valor) { secretoHmac = valor; }
    }
    public static class Autenticacion {
        private int maximoIntentos = 5;
        private int bloqueoMinutos = 15;
        public int getMaximoIntentos() { return maximoIntentos; }
        public void setMaximoIntentos(int valor) { maximoIntentos = valor; }
        public int getBloqueoMinutos() { return bloqueoMinutos; }
        public void setBloqueoMinutos(int valor) { bloqueoMinutos = valor; }
    }
    public static class Privacidad {
        private int mesesConservacionDatosClientes = 24;
        public int getMesesConservacionDatosClientes() { return mesesConservacionDatosClientes; }
        public void setMesesConservacionDatosClientes(int valor) { mesesConservacionDatosClientes = valor; }
    }
    public static class Cors {
        private List<String> origenesPermitidos = new ArrayList<>();
        public List<String> getOrigenesPermitidos() { return origenesPermitidos; }
        public void setOrigenesPermitidos(List<String> valor) { origenesPermitidos = valor; }
    }
    public static class ReservasPublicas {
        private String turnstileSecreto = "";
        private int maximoIntentos = 3;
        private int ventanaMinutos = 5;
        private int maximoCitasFuturasPorTelefono = 2;
        public String getTurnstileSecreto() { return turnstileSecreto; }
        public void setTurnstileSecreto(String valor) { turnstileSecreto = valor; }
        public int getMaximoIntentos() { return maximoIntentos; }
        public void setMaximoIntentos(int valor) { maximoIntentos = valor; }
        public int getVentanaMinutos() { return ventanaMinutos; }
        public void setVentanaMinutos(int valor) { ventanaMinutos = valor; }
        public int getMaximoCitasFuturasPorTelefono() { return maximoCitasFuturasPorTelefono; }
        public void setMaximoCitasFuturasPorTelefono(int valor) { maximoCitasFuturasPorTelefono = valor; }
    }
}
