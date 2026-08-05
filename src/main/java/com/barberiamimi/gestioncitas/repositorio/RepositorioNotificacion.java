package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface RepositorioNotificacion extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByBarberiaIdOrderByFechaCreacionDesc(Long barberiaId);
    List<Notificacion> findByBarberiaIdAndLeidaFalseOrderByFechaCreacionDesc(Long barberiaId);
    Optional<Notificacion> findByIdAndBarberiaId(Long id, Long barberiaId);
    @Modifying(clearAutomatically=true,flushAutomatically=true)
    @Query("delete from Notificacion n where n.barberia.id=:barberiaId and (n.profesional.id=:profesionalId or n.cita.id in (select c.id from Cita c where c.barberia.id=:barberiaId and c.profesional.id=:profesionalId))")
    void deleteRelacionadasConProfesional(@Param("barberiaId") Long barberiaId,@Param("profesionalId") Long profesionalId);
}
