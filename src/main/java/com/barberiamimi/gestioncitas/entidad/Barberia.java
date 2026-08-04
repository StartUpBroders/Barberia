package com.barberiamimi.gestioncitas.entidad;

import jakarta.persistence.*;

@Entity
@Table(name = "barberias")
public class Barberia extends EntidadAuditable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 120) private String nombre;
    @Column(nullable = false, unique = true, length = 80) private String slug;
    @Column(length = 20) private String telefono;
    @Column(length = 250) private String direccion;
    @Column(length = 120) private String instagram;
    @Column(name = "url_google_maps", length = 1000) private String urlGoogleMaps;
    @Column(name = "mostrar_ubicacion", nullable = false) private boolean mostrarUbicacion = false;
    @Column(nullable = false) private boolean activa = true;
    @Column(name = "intervalo_minutos", nullable = false) private int intervaloMinutos = 30;
    @Column(name = "dias_antelacion_reserva", nullable = false) private int diasAntelacionReserva = 30;
    protected Barberia() {}
    public Barberia(String nombre, String slug) { this.nombre = nombre; this.slug = slug; }
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public void setNombre(String valor) { nombre = valor; }
    public String getSlug() { return slug; }
    public void setSlug(String valor) { slug = valor; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String valor) { telefono = valor; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String valor) { direccion = valor; }
    public String getInstagram() { return instagram; }
    public void setInstagram(String valor) { instagram = valor; }
    public String getUrlGoogleMaps() { return urlGoogleMaps; }
    public void setUrlGoogleMaps(String valor) { urlGoogleMaps = valor; }
    public boolean isMostrarUbicacion() { return mostrarUbicacion; }
    public void setMostrarUbicacion(boolean valor) { mostrarUbicacion = valor; }
    public boolean isActiva() { return activa; }
    public void setActiva(boolean valor) { activa = valor; }
    public int getIntervaloMinutos() { return intervaloMinutos; }
    public void setIntervaloMinutos(int valor) { intervaloMinutos = valor; }
    public int getDiasAntelacionReserva() { return diasAntelacionReserva; }
    public void setDiasAntelacionReserva(int valor) { diasAntelacionReserva = valor; }
}
