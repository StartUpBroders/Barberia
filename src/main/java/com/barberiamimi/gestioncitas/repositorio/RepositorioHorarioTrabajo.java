package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.HorarioTrabajo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.DayOfWeek;
import java.util.*;
public interface RepositorioHorarioTrabajo extends JpaRepository<HorarioTrabajo, Long> {
    List<HorarioTrabajo> findByBarberiaIdAndProfesionalIdAndDiaSemanaAndActivoTrueOrderByHoraInicio(Long barberiaId, Long profesionalId, DayOfWeek dia);
    List<HorarioTrabajo> findByBarberiaIdAndProfesionalIdAndActivoTrueOrderByDiaSemanaAscHoraInicioAsc(Long barberiaId, Long profesionalId);
    List<HorarioTrabajo> findByBarberiaIdOrderByDiaSemanaAscHoraInicioAsc(Long barberiaId);
    Optional<HorarioTrabajo> findByIdAndBarberiaId(Long id, Long barberiaId);
    void deleteByBarberiaIdAndProfesionalId(Long barberiaId, Long profesionalId);
}
