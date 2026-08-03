package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface RepositorioServicio extends JpaRepository<Servicio, Long> {
    List<Servicio> findByBarberiaIdAndActivoTrueOrderByNombre(Long barberiaId);
    List<Servicio> findByBarberiaIdOrderByNombre(Long barberiaId);
    Optional<Servicio> findByIdAndBarberiaId(Long id, Long barberiaId);
    Optional<Servicio> findByIdAndBarberiaIdAndActivoTrue(Long id, Long barberiaId);
    boolean existsByBarberiaIdAndNombreIgnoreCase(Long barberiaId, String nombre);
}
