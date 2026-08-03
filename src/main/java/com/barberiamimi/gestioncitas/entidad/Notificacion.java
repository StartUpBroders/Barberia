package com.barberiamimi.gestioncitas.entidad;

import com.barberiamimi.gestioncitas.enumeracion.TipoNotificacion;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="notificaciones")
public class Notificacion {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="barberia_id", nullable=false) private Barberia barberia;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="profesional_id") private Profesional profesional;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="cita_id") private Cita cita;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=30) private TipoNotificacion tipo;
    @Column(nullable=false, length=150) private String titulo;
    @Column(nullable=false, length=1000) private String mensaje;
    @Column(nullable=false) private boolean leida;
    @Column(name="fecha_creacion", nullable=false, updatable=false) private LocalDateTime fechaCreacion;
    @Column(name="fecha_lectura") private LocalDateTime fechaLectura;
    protected Notificacion() {}
    public Notificacion(Barberia b, Profesional p, Cita c, TipoNotificacion t, String titulo, String mensaje){barberia=b;profesional=p;cita=c;tipo=t;this.titulo=titulo;this.mensaje=mensaje;}
    @PrePersist void alCrear(){fechaCreacion=LocalDateTime.now();}
    public Long getId(){return id;} public Barberia getBarberia(){return barberia;} public Profesional getProfesional(){return profesional;}
    public Cita getCita(){return cita;} public TipoNotificacion getTipo(){return tipo;} public String getTitulo(){return titulo;}
    public String getMensaje(){return mensaje;} public boolean isLeida(){return leida;} public LocalDateTime getFechaCreacion(){return fechaCreacion;} public LocalDateTime getFechaLectura(){return fechaLectura;}
    public void marcarLeida(){leida=true;fechaLectura=LocalDateTime.now();}
}
