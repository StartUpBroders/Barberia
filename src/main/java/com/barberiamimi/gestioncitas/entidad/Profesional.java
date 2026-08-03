package com.barberiamimi.gestioncitas.entidad;

import jakarta.persistence.*;

@Entity
@Table(name = "profesionales", uniqueConstraints = @UniqueConstraint(name = "uq_profesional_alias_barberia", columnNames = {"barberia_id", "alias"}))
public class Profesional extends EntidadAuditable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "barberia_id", nullable = false) private Barberia barberia;
    @Column(nullable = false, length = 100) private String nombre;
    @Column(length = 80) private String alias;
    @Column(nullable = false) private boolean activo = true;
    protected Profesional() {}
    public Profesional(Barberia barberia, String nombre, String alias) { this.barberia = barberia; this.nombre = nombre; this.alias = alias; }
    public Long getId() { return id; }
    public Barberia getBarberia() { return barberia; }
    public String getNombre() { return nombre; }
    public void setNombre(String valor) { nombre = valor; }
    public String getAlias() { return alias; }
    public void setAlias(String valor) { alias = valor; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean valor) { activo = valor; }
}
