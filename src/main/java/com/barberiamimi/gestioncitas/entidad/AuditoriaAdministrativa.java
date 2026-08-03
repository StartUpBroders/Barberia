package com.barberiamimi.gestioncitas.entidad;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="auditorias_administrativas")
public class AuditoriaAdministrativa {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="barberia_id", nullable=false) private Barberia barberia;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="usuario_id", nullable=false) private UsuarioAdministracion usuario;
    @Column(nullable=false, length=80) private String accion;
    @Column(name="tipo_recurso", nullable=false, length=80) private String tipoRecurso;
    @Column(name="recurso_id") private Long recursoId;
    @Column(name="fecha_creacion", nullable=false) private LocalDateTime fechaCreacion;
    protected AuditoriaAdministrativa() {}
    public AuditoriaAdministrativa(Barberia b, UsuarioAdministracion u, String a, String tipo, Long recurso){barberia=b;usuario=u;accion=a;tipoRecurso=tipo;recursoId=recurso;fechaCreacion=LocalDateTime.now();}
}
