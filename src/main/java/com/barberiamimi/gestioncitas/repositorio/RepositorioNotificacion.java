package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface RepositorioNotificacion extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByBarberiaIdOrderByFechaCreacionDesc(Long barberiaId);
    List<Notificacion> findByBarberiaIdAndLeidaFalseOrderByFechaCreacionDesc(Long barberiaId);
    Optional<Notificacion> findByIdAndBarberiaId(Long id, Long barberiaId);
}
