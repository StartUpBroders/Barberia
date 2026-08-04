package com.barberiamimi.gestioncitas.servicio;

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
    private final ServicioCatalogoPublico catalogo; private final RepositorioBarberia barberias; private final RepositorioServicio servicios;
    private final RepositorioProfesional profesionales; private final RepositorioHorarioTrabajo horarios; private final RepositorioDiaBloqueado bloqueos;
    private final RepositorioDiaTrabajoEspecial trabajosEspeciales; private final RepositorioCita citas; private final MapperRespuestas mapper;
    public ServicioDisponibilidad(ServicioCatalogoPublico c,RepositorioBarberia ba,RepositorioServicio s,RepositorioProfesional p,RepositorioHorarioTrabajo h,RepositorioDiaBloqueado b,RepositorioDiaTrabajoEspecial te,RepositorioCita ci,MapperRespuestas m){catalogo=c;barberias=ba;servicios=s;profesionales=p;horarios=h;bloqueos=b;trabajosEspeciales=te;citas=ci;mapper=m;}

    @Transactional(readOnly=true)
    public DisponibilidadRespuesta consultar(String slug,Long profesionalId,Long servicioId,LocalDate fecha){
        DatosConsulta datos=obtenerDatos(slug,profesionalId,servicioId); validarFechaPublica(datos.barberia(),fecha);
        return respuestaDia(datos,fecha);
    }

    @Transactional(readOnly=true)
    public CalendarioDisponibilidadRespuesta consultarCalendario(String slug,Long profesionalId,Long servicioId){
        DatosConsulta datos=obtenerDatosCalendario(slug,profesionalId,servicioId); LocalDate desde=LocalDate.now();
        LocalDate hasta=desde.plusDays(datos.barberia().getDiasAntelacionReserva()); List<DiaDisponibilidadRespuesta> dias=new ArrayList<>();
        AgendaPeriodo agenda=cargarAgenda(datos.barberia().getId(),datos.profesional().getId(),desde,hasta);
        for(LocalDate fecha=desde;!fecha.isAfter(hasta);fecha=fecha.plusDays(1)){
            List<TramoDisponibleRespuesta> tramos=calcularTramosPeriodo(datos.barberia(),datos.servicio(),fecha,agenda);
            dias.add(new DiaDisponibilidadRespuesta(fecha,!tramos.isEmpty(),tramos.size(),tramos));
        }
        return new CalendarioDisponibilidadRespuesta(desde,hasta,datos.barberia().getDiasAntelacionReserva(),dias);
    }

    @Transactional(readOnly=true)
    public void validarDisponible(Long barberiaId,Long profesionalId,LocalDateTime inicio,LocalDateTime fin){
        Barberia barberia=barberias.findById(barberiaId).orElseThrow(()->new RecursoNoEncontradoExcepcion("La barbería no existe."));
        validarFechaPublica(barberia,inicio.toLocalDate());
        if(!dentroDeHorario(barberiaId,profesionalId,inicio,fin)||!respetaCadencia(barberia,barberiaId,profesionalId,inicio,fin)||!estaLibre(barberiaId,profesionalId,inicio,fin))throw new CitaNoDisponibleExcepcion("El horario seleccionado no se encuentra disponible.");
    }

    @Transactional(readOnly=true)
    public void validarDisponibleExcluyendo(Long barberiaId,Long profesionalId,LocalDateTime inicio,LocalDateTime fin,Long citaId){
        boolean dentro=dentroDeHorario(barberiaId,profesionalId,inicio,fin);
        boolean bloqueado=estaBloqueado(barberiaId,profesionalId,inicio,fin);
        boolean solapado=citas.buscarSolapamientos(barberiaId,profesionalId,inicio,fin).stream().anyMatch(c->!c.getId().equals(citaId));
        if(!dentro||bloqueado||solapado)throw new CitaNoDisponibleExcepcion("El horario seleccionado no se encuentra disponible.");
    }

    private DatosConsulta obtenerDatos(String slug,Long profesionalId,Long servicioId){
        Barberia barberia=catalogo.buscarBarberia(slug);
        Servicio servicio=servicios.findByIdAndBarberiaIdAndActivoTrue(servicioId,barberia.getId()).orElseThrow(()->new RecursoNoEncontradoExcepcion("El servicio no existe o no está activo."));
        Profesional profesional=profesionales.findByIdAndBarberiaIdAndActivoTrue(profesionalId,barberia.getId()).orElseThrow(()->new RecursoNoEncontradoExcepcion("El profesional no existe o no está activo."));
        return new DatosConsulta(barberia,profesional,servicio);
    }

    private DatosConsulta obtenerDatosCalendario(String slug,Long profesionalId,Long servicioId){
        Barberia barberia=catalogo.buscarBarberia(slug);
        Profesional profesional=profesionales.findByIdAndBarberiaIdAndActivoTrue(profesionalId,barberia.getId()).orElseThrow(()->new RecursoNoEncontradoExcepcion("El profesional no existe o no está activo."));
        Servicio servicio=servicioId==null?null:servicios.findByIdAndBarberiaIdAndActivoTrue(servicioId,barberia.getId()).orElseThrow(()->new RecursoNoEncontradoExcepcion("El servicio no existe o no está activo."));
        return new DatosConsulta(barberia,profesional,servicio);
    }

    private DisponibilidadRespuesta respuestaDia(DatosConsulta datos,LocalDate fecha){return new DisponibilidadRespuesta(fecha,mapper.profesional(datos.profesional()),mapper.servicio(datos.servicio()),calcularTramos(datos.barberia(),datos.profesional(),datos.servicio(),fecha));}

    private List<TramoDisponibleRespuesta> calcularTramos(Barberia barberia,Profesional profesional,Servicio servicio,LocalDate fecha){
        List<TramoDisponibleRespuesta> tramos=new ArrayList<>(); int duracion=barberia.getIntervaloMinutos();
        for(FranjaTrabajo franja:franjasTrabajo(barberia.getId(),profesional.getId(),fecha)){
            LocalDateTime cursor=LocalDateTime.of(fecha,franja.inicio()); LocalDateTime limite=LocalDateTime.of(fecha,franja.fin());
            while(!cursor.plusMinutes(duracion).isAfter(limite)){
                LocalDateTime fin=cursor.plusMinutes(duracion);
                if(cursor.isAfter(LocalDateTime.now())&&estaLibre(barberia.getId(),profesional.getId(),cursor,fin))tramos.add(new TramoDisponibleRespuesta(cursor,fin));
                cursor=cursor.plusMinutes(duracion);
            }
        }
        return tramos;
    }

    private AgendaPeriodo cargarAgenda(Long barberiaId,Long profesionalId,LocalDate desde,LocalDate hasta){
        Map<DayOfWeek,List<HorarioTrabajo>> horariosSemana=horarios.findByBarberiaIdAndProfesionalIdAndActivoTrueOrderByDiaSemanaAscHoraInicioAsc(barberiaId,profesionalId).stream().collect(java.util.stream.Collectors.groupingBy(HorarioTrabajo::getDiaSemana));
        Map<LocalDate,List<DiaBloqueado>> bloqueosFecha=bloqueos.findByBarberiaIdAndProfesionalIdAndFechaBetweenOrderByFechaAscHoraInicioAsc(barberiaId,profesionalId,desde,hasta).stream().collect(java.util.stream.Collectors.groupingBy(DiaBloqueado::getFecha));
        Map<LocalDate,List<DiaTrabajoEspecial>> especialesFecha=trabajosEspeciales.findByBarberiaIdAndProfesionalIdAndFechaBetweenOrderByFechaAscHoraInicioAsc(barberiaId,profesionalId,desde,hasta).stream().collect(java.util.stream.Collectors.groupingBy(DiaTrabajoEspecial::getFecha));
        List<Cita> citasPeriodo=citas.buscarActivasEnRango(barberiaId,profesionalId,desde.atStartOfDay(),hasta.plusDays(1).atStartOfDay());
        return new AgendaPeriodo(horariosSemana,bloqueosFecha,especialesFecha,citasPeriodo);
    }

    private List<TramoDisponibleRespuesta> calcularTramosPeriodo(Barberia barberia,Servicio servicio,LocalDate fecha,AgendaPeriodo agenda){
        List<DiaBloqueado> bloqueosDia=agenda.bloqueos().getOrDefault(fecha,List.of());
        if(bloqueosDia.stream().anyMatch(d->d.getHoraInicio()==null))return List.of();
        List<DiaTrabajoEspecial> especiales=agenda.especiales().getOrDefault(fecha,List.of());
        List<FranjaTrabajo> franjas=especiales.isEmpty()?agenda.horarios().getOrDefault(fecha.getDayOfWeek(),List.of()).stream().map(h->new FranjaTrabajo(h.getHoraInicio(),h.getHoraFin())).toList():especiales.stream().map(d->new FranjaTrabajo(d.getHoraInicio(),d.getHoraFin())).toList();
        List<TramoDisponibleRespuesta> tramos=new ArrayList<>(); int duracion=barberia.getIntervaloMinutos();
        for(FranjaTrabajo franja:franjas){
            LocalDateTime cursor=LocalDateTime.of(fecha,franja.inicio()); LocalDateTime limite=LocalDateTime.of(fecha,franja.fin());
            while(!cursor.plusMinutes(duracion).isAfter(limite)){
                LocalDateTime fin=cursor.plusMinutes(duracion); LocalDateTime inicio=cursor;
                boolean bloqueado=bloqueosDia.stream().anyMatch(d->d.getHoraInicio()!=null&&inicio.toLocalTime().isBefore(d.getHoraFin())&&fin.toLocalTime().isAfter(d.getHoraInicio()));
                boolean ocupado=agenda.citas().stream().anyMatch(c->inicio.isBefore(c.getFechaFin())&&fin.isAfter(c.getFechaInicio()));
                if(inicio.isAfter(LocalDateTime.now())&&!bloqueado&&!ocupado)tramos.add(new TramoDisponibleRespuesta(inicio,fin));
                cursor=cursor.plusMinutes(duracion);
            }
        }
        return tramos;
    }

    private List<FranjaTrabajo> franjasTrabajo(Long barberiaId,Long profesionalId,LocalDate fecha){
        List<DiaBloqueado> bloqueosDia=bloqueos.findByBarberiaIdAndProfesionalIdAndFecha(barberiaId,profesionalId,fecha);
        if(bloqueosDia.stream().anyMatch(d->d.getHoraInicio()==null))return List.of();
        List<DiaTrabajoEspecial> especiales=trabajosEspeciales.findByBarberiaIdAndProfesionalIdAndFechaOrderByHoraInicio(barberiaId,profesionalId,fecha);
        if(!especiales.isEmpty())return especiales.stream().map(d->new FranjaTrabajo(d.getHoraInicio(),d.getHoraFin())).toList();
        return horarios.findByBarberiaIdAndProfesionalIdAndDiaSemanaAndActivoTrueOrderByHoraInicio(barberiaId,profesionalId,fecha.getDayOfWeek()).stream().map(h->new FranjaTrabajo(h.getHoraInicio(),h.getHoraFin())).toList();
    }

    private boolean dentroDeHorario(Long barberiaId,Long profesionalId,LocalDateTime inicio,LocalDateTime fin){return inicio.toLocalDate().equals(fin.toLocalDate())&&franjasTrabajo(barberiaId,profesionalId,inicio.toLocalDate()).stream().anyMatch(f->!inicio.toLocalTime().isBefore(f.inicio())&&!fin.toLocalTime().isAfter(f.fin()));}
    private boolean respetaCadencia(Barberia barberia,Long barberiaId,Long profesionalId,LocalDateTime inicio,LocalDateTime fin){long duracion=Duration.between(inicio,fin).toMinutes();long salto=Math.max(barberia.getIntervaloMinutos(),duracion);return duracion>0&&franjasTrabajo(barberiaId,profesionalId,inicio.toLocalDate()).stream().anyMatch(f->!inicio.toLocalTime().isBefore(f.inicio())&&!fin.toLocalTime().isAfter(f.fin())&&Duration.between(f.inicio(),inicio.toLocalTime()).toMinutes()%salto==0);}
    private boolean estaLibre(Long barberiaId,Long profesionalId,LocalDateTime inicio,LocalDateTime fin){return !estaBloqueado(barberiaId,profesionalId,inicio,fin)&&citas.buscarSolapamientos(barberiaId,profesionalId,inicio,fin).isEmpty();}
    private boolean estaBloqueado(Long barberiaId,Long profesionalId,LocalDateTime inicio,LocalDateTime fin){return bloqueos.findByBarberiaIdAndProfesionalIdAndFecha(barberiaId,profesionalId,inicio.toLocalDate()).stream().anyMatch(d->d.getHoraInicio()==null||(inicio.toLocalTime().isBefore(d.getHoraFin())&&fin.toLocalTime().isAfter(d.getHoraInicio())));}
    private void validarFechaPublica(Barberia barberia,LocalDate fecha){LocalDate hoy=LocalDate.now();if(fecha.isBefore(hoy)||fecha.isAfter(hoy.plusDays(barberia.getDiasAntelacionReserva())))throw new SolicitudInvalidaExcepcion("La fecha debe estar dentro del período de reserva permitido.");}
    private record DatosConsulta(Barberia barberia,Profesional profesional,Servicio servicio){}
    private record FranjaTrabajo(LocalTime inicio,LocalTime fin){}
    private record AgendaPeriodo(Map<DayOfWeek,List<HorarioTrabajo>> horarios,Map<LocalDate,List<DiaBloqueado>> bloqueos,Map<LocalDate,List<DiaTrabajoEspecial>> especiales,List<Cita> citas){}
}
