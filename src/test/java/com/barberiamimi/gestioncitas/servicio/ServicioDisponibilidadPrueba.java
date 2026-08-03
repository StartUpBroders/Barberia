package com.barberiamimi.gestioncitas.servicio;
import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import com.barberiamimi.gestioncitas.entidad.*;
import com.barberiamimi.gestioncitas.excepcion.CitaNoDisponibleExcepcion;
import com.barberiamimi.gestioncitas.mapper.MapperRespuestas;
import com.barberiamimi.gestioncitas.repositorio.*;
import org.junit.jupiter.api.*;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ServicioDisponibilidadPrueba {
 private final ServicioCatalogoPublico catalogo=mock(ServicioCatalogoPublico.class);private final RepositorioServicio servicios=mock(RepositorioServicio.class);private final RepositorioProfesional profesionales=mock(RepositorioProfesional.class);private final RepositorioHorarioTrabajo horarios=mock(RepositorioHorarioTrabajo.class);private final RepositorioDiaBloqueado bloqueos=mock(RepositorioDiaBloqueado.class);private final RepositorioCita citas=mock(RepositorioCita.class);
 private ServicioDisponibilidad servicio;private Barberia barberia;private Profesional profesional;private Servicio corte;private LocalDate fecha;
 @BeforeEach void preparar()throws Exception{reset(catalogo,servicios,profesionales,horarios,bloqueos,citas);barberia=new Barberia("Mimi","mimi");id(barberia,1L);profesional=new Profesional(barberia,"Mimi","mimi");id(profesional,2L);corte=new Servicio(barberia,"Corte",null,new BigDecimal("15"),30);id(corte,3L);fecha=LocalDate.now().plusYears(2);HorarioTrabajo h=new HorarioTrabajo(barberia,profesional,fecha.getDayOfWeek(),LocalTime.of(9,0),LocalTime.of(10,0));when(catalogo.buscarBarberia("mimi")).thenReturn(barberia);when(servicios.findByIdAndBarberiaIdAndActivoTrue(3L,1L)).thenReturn(Optional.of(corte));when(profesionales.findByIdAndBarberiaIdAndActivoTrue(2L,1L)).thenReturn(Optional.of(profesional));when(horarios.findByBarberiaIdAndProfesionalIdAndDiaSemanaAndActivoTrueOrderByHoraInicio(1L,2L,fecha.getDayOfWeek())).thenReturn(List.of(h));when(bloqueos.findByBarberiaIdAndProfesionalIdAndFecha(1L,2L,fecha)).thenReturn(List.of());when(citas.buscarSolapamientos(eq(1L),eq(2L),any(),any())).thenReturn(List.of());servicio=new ServicioDisponibilidad(catalogo,servicios,profesionales,horarios,bloqueos,citas,new PropiedadesAplicacion(),new MapperRespuestas());}
 @Test @DisplayName("Debe ofrecer tramos respetando la duración y el intervalo") void debeOfrecerTramos(){var r=servicio.consultar("mimi",2L,3L,fecha);assertEquals(3,r.horariosDisponibles().size());assertEquals(LocalTime.of(9,0),r.horariosDisponibles().getFirst().fechaInicio().toLocalTime());assertEquals(LocalTime.of(9,30),r.horariosDisponibles().getFirst().fechaFin().toLocalTime());}
 @Test @DisplayName("Debe excluir un día completamente bloqueado") void debeExcluirDiaBloqueado(){when(bloqueos.findByBarberiaIdAndProfesionalIdAndFecha(1L,2L,fecha)).thenReturn(List.of(new DiaBloqueado(barberia,profesional,fecha,null,null,"Vacaciones")));assertTrue(servicio.consultar("mimi",2L,3L,fecha).horariosDisponibles().isEmpty());}
 @Test @DisplayName("Debe rechazar una cita fuera del horario") void debeRechazarFueraDelHorario(){LocalDateTime inicio=LocalDateTime.of(fecha,LocalTime.of(8,30));assertThrows(CitaNoDisponibleExcepcion.class,()->servicio.validarDisponible(1L,2L,inicio,inicio.plusMinutes(30)));}
 @Test @DisplayName("Debe excluir citas activas que se solapan parcialmente") void debeExcluirSolapamientos(){when(citas.buscarSolapamientos(eq(1L),eq(2L),any(),any())).thenReturn(List.of(mock(Cita.class)));assertTrue(servicio.consultar("mimi",2L,3L,fecha).horariosDisponibles().isEmpty());}
 @Test @DisplayName("Debe validar una reprogramación ignorando la propia cita") void debeIgnorarLaPropiaCita()throws Exception{Cita propia=mock(Cita.class);when(propia.getId()).thenReturn(80L);when(citas.buscarSolapamientos(eq(1L),eq(2L),any(),any())).thenReturn(List.of(propia));LocalDateTime inicio=LocalDateTime.of(fecha,LocalTime.of(9,0));assertDoesNotThrow(()->servicio.validarDisponibleExcluyendo(1L,2L,inicio,inicio.plusMinutes(30),80L));Cita otra=mock(Cita.class);when(otra.getId()).thenReturn(81L);when(citas.buscarSolapamientos(eq(1L),eq(2L),any(),any())).thenReturn(List.of(otra));assertThrows(CitaNoDisponibleExcepcion.class,()->servicio.validarDisponibleExcluyendo(1L,2L,inicio,inicio.plusMinutes(30),80L));}
 private static void id(Object o,Long valor)throws Exception{Field f=o.getClass().getDeclaredField("id");f.setAccessible(true);f.set(o,valor);}
}
