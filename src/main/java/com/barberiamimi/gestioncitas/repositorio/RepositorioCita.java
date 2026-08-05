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
    List<Cita> findByBarberiaIdAndEstadoOrderByFechaInicioAsc(Long barberiaId, EstadoCita estado);
    List<Cita> findByBarberiaIdAndEstadoInOrderByFechaInicioAsc(Long barberiaId, Collection<EstadoCita> estados);
    void deleteByBarberiaIdAndProfesionalId(Long barberiaId, Long profesionalId);
    boolean existsByBarberiaIdAndServicioId(Long barberiaId, Long servicioId);
    List<Cita> findByBarberiaIdAndTelefonoClienteAndEstadoInAndAnonimizadaFalse(Long barberiaId, String telefono, Collection<EstadoCita> estados);
    @Query("select count(c) from Cita c where c.barberia.id=:barberiaId and replace(c.telefonoCliente, ' ', '')=:telefono and c.estado=:estado and c.fechaInicio>:fecha")
    long countByBarberiaIdAndTelefonoClienteAndEstadoAndFechaInicioAfter(@Param("barberiaId") Long barberiaId, @Param("telefono") String telefono, @Param("estado") EstadoCita estado, @Param("fecha") LocalDateTime fecha);
    @Query("select c from Cita c where c.barberia.id=:barberiaId and c.profesional.id=:profesionalId and c.estado in (com.barberiamimi.gestioncitas.enumeracion.EstadoCita.RESERVADA, com.barberiamimi.gestioncitas.enumeracion.EstadoCita.CONFIRMADA) and c.fechaInicio < :fin and c.fechaFin > :inicio")
    List<Cita> buscarSolapamientos(@Param("barberiaId") Long barberiaId, @Param("profesionalId") Long profesionalId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
    @Query("select c from Cita c where c.barberia.id=:barberiaId and c.profesional.id=:profesionalId and c.estado in (com.barberiamimi.gestioncitas.enumeracion.EstadoCita.RESERVADA, com.barberiamimi.gestioncitas.enumeracion.EstadoCita.CONFIRMADA) and c.fechaInicio < :fin and c.fechaFin > :inicio order by c.fechaInicio")
    List<Cita> buscarActivasEnRango(@Param("barberiaId") Long barberiaId, @Param("profesionalId") Long profesionalId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
    @Query("select c from Cita c where c.fechaInicio < :limite and c.anonimizada=false")
    List<Cita> buscarParaAnonimizar(@Param("limite") LocalDateTime limite);
    @Modifying(clearAutomatically=true,flushAutomatically=true)
    @Query("update Cita c set c.estado=com.barberiamimi.gestioncitas.enumeracion.EstadoCita.COMPLETADA where c.estado=com.barberiamimi.gestioncitas.enumeracion.EstadoCita.CONFIRMADA and c.fechaFin<=:ahora")
    int completarConfirmadasFinalizadas(@Param("ahora") LocalDateTime ahora);
}
