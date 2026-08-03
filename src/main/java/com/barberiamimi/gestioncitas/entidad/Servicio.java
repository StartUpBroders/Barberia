package com.barberiamimi.gestioncitas.entidad;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "servicios", uniqueConstraints = @UniqueConstraint(name = "uq_servicio_nombre_barberia", columnNames = {"barberia_id", "nombre"}))
public class Servicio extends EntidadAuditable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "barberia_id", nullable = false) private Barberia barberia;
    @Column(nullable = false, length = 120) private String nombre;
    @Column(length = 600) private String descripcion;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal precio;
    @Column(name = "duracion_minutos", nullable = false) private int duracionMinutos;
    @Column(nullable = false) private boolean activo = true;
    protected Servicio() {}
    public Servicio(Barberia barberia, String nombre, String descripcion, BigDecimal precio, int duracionMinutos) { this.barberia = barberia; this.nombre = nombre; this.descripcion = descripcion; this.precio = precio; this.duracionMinutos = duracionMinutos; }
    public Long getId() { return id; }
    public Barberia getBarberia() { return barberia; }
    public String getNombre() { return nombre; }
    public void setNombre(String valor) { nombre = valor; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String valor) { descripcion = valor; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal valor) { precio = valor; }
    public int getDuracionMinutos() { return duracionMinutos; }
    public void setDuracionMinutos(int valor) { duracionMinutos = valor; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean valor) { activo = valor; }
}
