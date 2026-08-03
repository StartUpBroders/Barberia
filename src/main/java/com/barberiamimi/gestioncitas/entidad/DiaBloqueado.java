package com.barberiamimi.gestioncitas.entidad;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "dias_bloqueados")
public class DiaBloqueado {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "barberia_id", nullable = false) private Barberia barberia;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "profesional_id", nullable = false) private Profesional profesional;
    @Column(nullable = false) private LocalDate fecha;
    @Column(name = "hora_inicio") private LocalTime horaInicio;
    @Column(name = "hora_fin") private LocalTime horaFin;
    @Column(length = 250) private String motivo;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion;
    protected DiaBloqueado() {}
    public DiaBloqueado(Barberia b, Profesional p, LocalDate f, LocalTime inicio, LocalTime fin, String m) { barberia=b; profesional=p; fecha=f; horaInicio=inicio; horaFin=fin; motivo=m; }
    @PrePersist void alCrear(){fechaCreacion=LocalDateTime.now();}
    public Long getId(){return id;} public Barberia getBarberia(){return barberia;} public Profesional getProfesional(){return profesional;}
    public LocalDate getFecha(){return fecha;} public void setFecha(LocalDate v){fecha=v;}
    public LocalTime getHoraInicio(){return horaInicio;} public void setHoraInicio(LocalTime v){horaInicio=v;}
    public LocalTime getHoraFin(){return horaFin;} public void setHoraFin(LocalTime v){horaFin=v;}
    public String getMotivo(){return motivo;} public void setMotivo(String v){motivo=v;}
}
