package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.IntentoCancelacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.Optional;
public interface RepositorioIntentoCancelacion extends JpaRepository<IntentoCancelacion, Long> {
    long countByBarberiaIdAndHuellaOrigenAndExitosoFalseAndFechaIntentoAfter(Long barberiaId, String huella, LocalDateTime desde);
    Optional<IntentoCancelacion> findTopByBarberiaIdAndHuellaOrigenAndExitosoFalseOrderByFechaIntentoDesc(Long barberiaId,String huella);
}
