package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.DiaTrabajoEspecial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.*;
public interface RepositorioDiaTrabajoEspecial extends JpaRepository<DiaTrabajoEspecial,Long> {
    List<DiaTrabajoEspecial> findByBarberiaIdAndProfesionalIdAndFechaOrderByHoraInicio(Long barberiaId,Long profesionalId,LocalDate fecha);
    List<DiaTrabajoEspecial> findByBarberiaIdAndProfesionalIdAndFechaBetweenOrderByFechaAscHoraInicioAsc(Long barberiaId,Long profesionalId,LocalDate desde,LocalDate hasta);
    List<DiaTrabajoEspecial> findByBarberiaIdOrderByFechaAscHoraInicioAsc(Long barberiaId);
    Optional<DiaTrabajoEspecial> findByIdAndBarberiaId(Long id,Long barberiaId);
    void deleteByBarberiaIdAndProfesionalId(Long barberiaId,Long profesionalId);
}
