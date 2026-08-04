package com.barberiamimi.gestioncitas.entidad;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "dias_trabajo_especial")
public class DiaTrabajoEspecial {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "barberia_id", nullable = false) private Barberia barberia;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "profesional_id", nullable = false) private Profesional profesional;
    @Column(nullable = false) private LocalDate fecha;
    @Column(name = "hora_inicio", nullable = false) private LocalTime horaInicio;
    @Column(name = "hora_fin", nullable = false) private LocalTime horaFin;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion;
    protected DiaTrabajoEspecial() {}
    public DiaTrabajoEspecial(Barberia b, Profesional p, LocalDate f, LocalTime inicio, LocalTime fin) { barberia=b; profesional=p; fecha=f; horaInicio=inicio; horaFin=fin; }
    @PrePersist void alCrear(){fechaCreacion=LocalDateTime.now();}
    public Long getId(){return id;} public Barberia getBarberia(){return barberia;} public Profesional getProfesional(){return profesional;}
    public LocalDate getFecha(){return fecha;} public void setFecha(LocalDate valor){fecha=valor;}
    public LocalTime getHoraInicio(){return horaInicio;} public void setHoraInicio(LocalTime valor){horaInicio=valor;}
    public LocalTime getHoraFin(){return horaFin;} public void setHoraFin(LocalTime valor){horaFin=valor;}
}
