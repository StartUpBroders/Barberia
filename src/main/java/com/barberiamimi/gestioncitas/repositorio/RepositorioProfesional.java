package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.Profesional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface RepositorioProfesional extends JpaRepository<Profesional, Long> {
    List<Profesional> findByBarberiaIdAndActivoTrueOrderByNombre(Long barberiaId);
    List<Profesional> findByBarberiaIdOrderByNombre(Long barberiaId);
    Optional<Profesional> findByIdAndBarberiaId(Long id, Long barberiaId);
    Optional<Profesional> findByIdAndBarberiaIdAndActivoTrue(Long id, Long barberiaId);
}
