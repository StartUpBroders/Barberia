package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.DiaBloqueado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.*;
public interface RepositorioDiaBloqueado extends JpaRepository<DiaBloqueado, Long> {
    List<DiaBloqueado> findByBarberiaIdAndProfesionalIdAndFecha(Long barberiaId, Long profesionalId, LocalDate fecha);
    List<DiaBloqueado> findByBarberiaIdAndProfesionalIdAndFechaBetweenOrderByFechaAscHoraInicioAsc(Long barberiaId, Long profesionalId, LocalDate desde, LocalDate hasta);
    List<DiaBloqueado> findByBarberiaIdOrderByFechaDesc(Long barberiaId);
    Optional<DiaBloqueado> findByIdAndBarberiaId(Long id, Long barberiaId);
    void deleteByBarberiaIdAndProfesionalId(Long barberiaId, Long profesionalId);
}
