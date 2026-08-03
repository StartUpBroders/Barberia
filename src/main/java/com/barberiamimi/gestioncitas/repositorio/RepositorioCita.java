package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.Cita;
import com.barberiamimi.gestioncitas.enumeracion.EstadoCita;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.*;
public interface RepositorioCita extends JpaRepository<Cita, Long> {
    Optional<Cita> findByBarberiaIdAndClaveIdempotencia(Long barberiaId, String clave);
    Optional<Cita> findByIdAndBarberiaId(Long id, Long barberiaId);
    List<Cita> findByBarberiaIdOrderByFechaInicioDesc(Long barberiaId);
    List<Cita> findByBarberiaIdAndProfesionalIdOrderByFechaInicioDesc(Long barberiaId, Long profesionalId);
    List<Cita> findByBarberiaIdAndTelefonoClienteAndEstadoInAndAnonimizadaFalse(Long barberiaId, String telefono, Collection<EstadoCita> estados);
    @Query("select c from Cita c where c.barberia.id=:barberiaId and c.profesional.id=:profesionalId and c.estado in (com.barberiamimi.gestioncitas.enumeracion.EstadoCita.RESERVADA, com.barberiamimi.gestioncitas.enumeracion.EstadoCita.CONFIRMADA) and c.fechaInicio < :fin and c.fechaFin > :inicio")
    List<Cita> buscarSolapamientos(@Param("barberiaId") Long barberiaId, @Param("profesionalId") Long profesionalId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
    @Query("select c from Cita c where c.fechaInicio < :limite and c.anonimizada=false")
    List<Cita> buscarParaAnonimizar(@Param("limite") LocalDateTime limite);
}
