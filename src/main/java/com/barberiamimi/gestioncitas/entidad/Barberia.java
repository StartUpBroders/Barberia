package com.barberiamimi.gestioncitas.entidad;

import jakarta.persistence.*;

@Entity
@Table(name = "barberias")
public class Barberia extends EntidadAuditable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 120) private String nombre;
    @Column(nullable = false, unique = true, length = 80) private String slug;
    @Column(length = 20) private String telefono;
    @Column(length = 150) private String correo;
    @Column(length = 250) private String direccion;
    @Column(nullable = false) private boolean activa = true;
    protected Barberia() {}
    public Barberia(String nombre, String slug) { this.nombre = nombre; this.slug = slug; }
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public void setNombre(String valor) { nombre = valor; }
    public String getSlug() { return slug; }
    public void setSlug(String valor) { slug = valor; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String valor) { telefono = valor; }
    public String getCorreo() { return correo; }
    public void setCorreo(String valor) { correo = valor; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String valor) { direccion = valor; }
    public boolean isActiva() { return activa; }
    public void setActiva(boolean valor) { activa = valor; }
}
