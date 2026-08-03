package com.barberiamimi.gestioncitas.configuracion;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@ConfigurationProperties(prefix = "aplicacion")
public class PropiedadesAplicacion {
    private final Cancelacion cancelacion = new Cancelacion();
    private final Autenticacion autenticacion = new Autenticacion();
    private final Disponibilidad disponibilidad = new Disponibilidad();
    private final Privacidad privacidad = new Privacidad();
    private final Cors cors = new Cors();
    public Cancelacion getCancelacion() { return cancelacion; }
    public Autenticacion getAutenticacion() { return autenticacion; }
    public Disponibilidad getDisponibilidad() { return disponibilidad; }
    public Privacidad getPrivacidad() { return privacidad; }
    public Cors getCors() { return cors; }

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
    public static class Disponibilidad {
        private int intervaloMinutos = 15;
        public int getIntervaloMinutos() { return intervaloMinutos; }
        public void setIntervaloMinutos(int valor) { intervaloMinutos = valor; }
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
}
