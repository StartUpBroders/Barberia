package com.barberiamimi.gestioncitas.entidad;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="intentos_cancelacion", indexes=@Index(name="idx_intento_cancelacion_busqueda", columnList="barberia_id,huella_origen,fecha_intento"))
public class IntentoCancelacion {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="barberia_id", nullable=false) private Barberia barberia;
    @Column(name="huella_origen", nullable=false, length=64) private String huellaOrigen;
    @Column(name="fecha_intento", nullable=false) private LocalDateTime fechaIntento;
    @Column(nullable=false) private boolean exitoso;
    protected IntentoCancelacion() {}
    public IntentoCancelacion(Barberia b, String huella, boolean exitoso){barberia=b;huellaOrigen=huella;this.exitoso=exitoso;fechaIntento=LocalDateTime.now();}
    public LocalDateTime getFechaIntento(){return fechaIntento;}
}
