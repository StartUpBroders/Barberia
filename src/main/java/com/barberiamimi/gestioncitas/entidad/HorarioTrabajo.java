package com.barberiamimi.gestioncitas.entidad;

import jakarta.persistence.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(name = "horarios_trabajo")
public class HorarioTrabajo extends EntidadAuditable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "barberia_id", nullable = false) private Barberia barberia;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "profesional_id", nullable = false) private Profesional profesional;
    @Enumerated(EnumType.STRING) @Column(name = "dia_semana", nullable = false, length = 12) private DayOfWeek diaSemana;
    @Column(name = "hora_inicio", nullable = false) private LocalTime horaInicio;
    @Column(name = "hora_fin", nullable = false) private LocalTime horaFin;
    @Column(nullable = false) private boolean activo = true;
    protected HorarioTrabajo() {}
    public HorarioTrabajo(Barberia b, Profesional p, DayOfWeek d, LocalTime inicio, LocalTime fin) { barberia=b; profesional=p; diaSemana=d; horaInicio=inicio; horaFin=fin; }
    public Long getId(){return id;} public Barberia getBarberia(){return barberia;} public Profesional getProfesional(){return profesional;}
    public DayOfWeek getDiaSemana(){return diaSemana;} public void setDiaSemana(DayOfWeek v){diaSemana=v;}
    public LocalTime getHoraInicio(){return horaInicio;} public void setHoraInicio(LocalTime v){horaInicio=v;}
    public LocalTime getHoraFin(){return horaFin;} public void setHoraFin(LocalTime v){horaFin=v;}
    public boolean isActivo(){return activo;} public void setActivo(boolean v){activo=v;}
}
