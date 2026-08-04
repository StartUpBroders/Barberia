package com.barberiamimi.gestioncitas.repositorio;

import com.barberiamimi.gestioncitas.entidad.IntentoReserva;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepositorioIntentoReserva extends JpaRepository<IntentoReserva, Long> {
    long countByBarberiaIdAndHuellaOrigenAndFechaIntentoAfter(Long barberiaId, String huellaOrigen, LocalDateTime desde);
    long deleteByFechaIntentoBefore(LocalDateTime limite);
}
