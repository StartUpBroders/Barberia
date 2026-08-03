package com.barberiamimi.gestioncitas.servicio;

import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import com.barberiamimi.gestioncitas.dto.respuesta.*;
import com.barberiamimi.gestioncitas.entidad.*;
import com.barberiamimi.gestioncitas.excepcion.*;
import com.barberiamimi.gestioncitas.mapper.MapperRespuestas;
import com.barberiamimi.gestioncitas.repositorio.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
public class ServicioDisponibilidad {
    private final ServicioCatalogoPublico catalogo; private final RepositorioServicio servicios; private final RepositorioProfesional profesionales;
    private final RepositorioHorarioTrabajo horarios; private final RepositorioDiaBloqueado bloqueos; private final RepositorioCita citas;
    private final PropiedadesAplicacion propiedades; private final MapperRespuestas mapper;
    public ServicioDisponibilidad(ServicioCatalogoPublico c,RepositorioServicio s,RepositorioProfesional p,RepositorioHorarioTrabajo h,RepositorioDiaBloqueado b,RepositorioCita ci,PropiedadesAplicacion pr,MapperRespuestas m){catalogo=c;servicios=s;profesionales=p;horarios=h;bloqueos=b;citas=ci;propiedades=pr;mapper=m;}
    @Transactional(readOnly=true)
    public DisponibilidadRespuesta consultar(String slug,Long profesionalId,Long servicioId,LocalDate fecha){
        Barberia b=catalogo.buscarBarberia(slug); Servicio s=servicios.findByIdAndBarberiaIdAndActivoTrue(servicioId,b.getId()).orElseThrow(()->new RecursoNoEncontradoExcepcion("El servicio no existe o no está activo."));
        Profesional p=profesionales.findByIdAndBarberiaIdAndActivoTrue(profesionalId,b.getId()).orElseThrow(()->new RecursoNoEncontradoExcepcion("El profesional no existe o no está activo."));
        List<TramoDisponibleRespuesta> tramos=new ArrayList<>(); int salto=propiedades.getDisponibilidad().getIntervaloMinutos();
        for(HorarioTrabajo h:horarios.findByBarberiaIdAndProfesionalIdAndDiaSemanaAndActivoTrueOrderByHoraInicio(b.getId(),p.getId(),fecha.getDayOfWeek())){
            LocalDateTime cursor=LocalDateTime.of(fecha,h.getHoraInicio()); LocalDateTime limite=LocalDateTime.of(fecha,h.getHoraFin());
            while(!cursor.plusMinutes(s.getDuracionMinutos()).isAfter(limite)){LocalDateTime fin=cursor.plusMinutes(s.getDuracionMinutos());if(cursor.isAfter(LocalDateTime.now())&&estaLibre(b.getId(),p.getId(),cursor,fin))tramos.add(new TramoDisponibleRespuesta(cursor,fin));cursor=cursor.plusMinutes(salto);}
        }
        return new DisponibilidadRespuesta(fecha,mapper.profesional(p),mapper.servicio(s),tramos);
    }
    @Transactional(readOnly=true)
    public void validarDisponible(Long barberiaId,Long profesionalId,LocalDateTime inicio,LocalDateTime fin){
        boolean dentro=horarios.findByBarberiaIdAndProfesionalIdAndDiaSemanaAndActivoTrueOrderByHoraInicio(barberiaId,profesionalId,inicio.getDayOfWeek()).stream().anyMatch(h->!inicio.toLocalTime().isBefore(h.getHoraInicio())&&!fin.toLocalTime().isAfter(h.getHoraFin())&&inicio.toLocalDate().equals(fin.toLocalDate()));
        if(!dentro)throw new CitaNoDisponibleExcepcion("La cita queda fuera del horario de trabajo.");
        if(!estaLibre(barberiaId,profesionalId,inicio,fin))throw new CitaNoDisponibleExcepcion("El horario seleccionado no se encuentra disponible.");
    }
    @Transactional(readOnly=true)
    public void validarDisponibleExcluyendo(Long barberiaId,Long profesionalId,LocalDateTime inicio,LocalDateTime fin,Long citaId){
        boolean dentro=horarios.findByBarberiaIdAndProfesionalIdAndDiaSemanaAndActivoTrueOrderByHoraInicio(barberiaId,profesionalId,inicio.getDayOfWeek()).stream().anyMatch(h->!inicio.toLocalTime().isBefore(h.getHoraInicio())&&!fin.toLocalTime().isAfter(h.getHoraFin())&&inicio.toLocalDate().equals(fin.toLocalDate()));
        boolean bloqueado=bloqueos.findByBarberiaIdAndProfesionalIdAndFecha(barberiaId,profesionalId,inicio.toLocalDate()).stream().anyMatch(d->d.getHoraInicio()==null||(inicio.toLocalTime().isBefore(d.getHoraFin())&&fin.toLocalTime().isAfter(d.getHoraInicio())));
        boolean solapado=citas.buscarSolapamientos(barberiaId,profesionalId,inicio,fin).stream().anyMatch(c->!c.getId().equals(citaId));
        if(!dentro||bloqueado||solapado)throw new CitaNoDisponibleExcepcion("El horario seleccionado no se encuentra disponible.");
    }
    private boolean estaLibre(Long barberiaId,Long profesionalId,LocalDateTime inicio,LocalDateTime fin){
        boolean bloqueado=bloqueos.findByBarberiaIdAndProfesionalIdAndFecha(barberiaId,profesionalId,inicio.toLocalDate()).stream().anyMatch(d->d.getHoraInicio()==null||(inicio.toLocalTime().isBefore(d.getHoraFin())&&fin.toLocalTime().isAfter(d.getHoraInicio())));
        return !bloqueado&&citas.buscarSolapamientos(barberiaId,profesionalId,inicio,fin).isEmpty();
    }
}
