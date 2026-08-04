package com.barberiamimi.gestioncitas.entidad;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "intentos_reserva", indexes = @Index(name = "idx_intento_reserva_busqueda", columnList = "barberia_id,huella_origen,fecha_intento"))
public class IntentoReserva {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "barberia_id", nullable = false) private Barberia barberia;
    @Column(name = "huella_origen", nullable = false, length = 64) private String huellaOrigen;
    @Column(name = "fecha_intento", nullable = false) private LocalDateTime fechaIntento;

    protected IntentoReserva() {}

    public IntentoReserva(Barberia barberia, String huellaOrigen) {
        this.barberia = barberia;
        this.huellaOrigen = huellaOrigen;
        fechaIntento = LocalDateTime.now();
    }
}
