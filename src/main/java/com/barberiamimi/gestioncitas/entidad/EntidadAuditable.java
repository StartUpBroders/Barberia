package com.barberiamimi.gestioncitas.entidad;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.LocalDateTime;

@MappedSuperclass
public abstract class EntidadAuditable {
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
    @PrePersist void alCrear() { fechaCreacion = LocalDateTime.now(); fechaActualizacion = fechaCreacion; }
    @PreUpdate void alActualizar() { fechaActualizacion = LocalDateTime.now(); }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
}
