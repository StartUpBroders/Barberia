package com.barberiamimi.gestioncitas.servicio;
import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import com.barberiamimi.gestioncitas.dto.solicitud.SolicitudCancelarCita;
import com.barberiamimi.gestioncitas.entidad.*;
import com.barberiamimi.gestioncitas.enumeracion.EstadoCita;
import com.barberiamimi.gestioncitas.excepcion.CodigoCancelacionIncorrectoExcepcion;
import com.barberiamimi.gestioncitas.excepcion.CancelacionNoPermitidaExcepcion;
import com.barberiamimi.gestioncitas.excepcion.LimiteIntentosSuperadoExcepcion;
import com.barberiamimi.gestioncitas.repositorio.*;
import com.barberiamimi.gestioncitas.utilidad.UtilidadCriptografica;
import org.junit.jupiter.api.*;
import org.mockito.ArgumentCaptor;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ServicioCancelacionPrueba {
 private final ServicioCatalogoPublico catalogo=mock(ServicioCatalogoPublico.class);private final RepositorioCita citas=mock(RepositorioCita.class);private final RepositorioNotificacion notificaciones=mock(RepositorioNotificacion.class);private final RepositorioIntentoCancelacion intentos=mock(RepositorioIntentoCancelacion.class);private final UtilidadCriptografica crypto=new UtilidadCriptografica();private PropiedadesAplicacion propiedades;private ServicioCancelacion servicio;private Barberia barberia;private Cita cita;
 @BeforeEach void preparar()throws Exception{reset(catalogo,citas,notificaciones,intentos);propiedades=new PropiedadesAplicacion();propiedades.getCancelacion().setSecretoHmac("secreto-de-prueba-muy-largo-123456");barberia=new Barberia("Mimi","mimi");id(barberia,1L);Profesional p=new Profesional(barberia,"Mimi","mimi");id(p,2L);Servicio s=new Servicio(barberia,"Corte",null,new BigDecimal("15"),30);id(s,3L);cita=new Cita(barberia,p,s,"Ana","600123123",LocalDateTime.now().plusDays(3),LocalDateTime.now().plusDays(3).plusMinutes(30),null,null,"clave","huella");id(cita,10L);cita.setCodigoCancelacionHmac(crypto.hmac("01234:10",propiedades.getCancelacion().getSecretoHmac()));when(catalogo.buscarBarberia("mimi")).thenReturn(barberia);when(intentos.findTopByBarberiaIdAndHuellaOrigenAndExitosoFalseOrderByFechaIntentoDesc(anyLong(),anyString())).thenReturn(Optional.empty());servicio=new ServicioCancelacion(catalogo,citas,notificaciones,intentos,crypto,propiedades);}
 @Test @DisplayName("Debe cancelar una cita con teléfono y código correctos") void debeCancelar(){cita.setFechaInicio(LocalDateTime.of(2030,9,10,9,0));cita.setFechaFin(LocalDateTime.of(2030,9,10,9,45));when(citas.findByBarberiaIdAndTelefonoClienteAndEstadoInAndAnonimizadaFalse(eq(1L),eq("600123123"),any())).thenReturn(List.of(cita));var r=servicio.cancelar("mimi",new SolicitudCancelarCita("600123123","01234"),"127.0.0.1");assertEquals("CITA_CANCELADA",r.codigo());assertEquals(EstadoCita.CANCELADA_POR_CLIENTE,cita.getEstado());assertNull(cita.getCodigoCancelacionHmac());ArgumentCaptor<Notificacion> aviso=ArgumentCaptor.forClass(Notificacion.class);verify(notificaciones).save(aviso.capture());assertEquals("Ana canceló su cita",aviso.getValue().getTitulo());assertEquals("La cita del martes 10 de septiembre de 2030, de 09:00 a 09:45, con Mimi para Corte ha sido cancelada. Ese horario vuelve a estar disponible.",aviso.getValue().getMensaje());verify(intentos).save(any(IntentoCancelacion.class));}
 @Test @DisplayName("Debe usar una respuesta genérica y registrar un código incorrecto") void debeRechazarCodigo(){when(citas.findByBarberiaIdAndTelefonoClienteAndEstadoInAndAnonimizadaFalse(eq(1L),eq("600123123"),any())).thenReturn(List.of(cita));assertThrows(CodigoCancelacionIncorrectoExcepcion.class,()->servicio.cancelar("mimi",new SolicitudCancelarCita("600123123","99999"),"127.0.0.1"));verify(intentos).save(any(IntentoCancelacion.class));verifyNoInteractions(notificaciones);}
 @Test @DisplayName("Debe bloquear temporalmente después del máximo de fallos") void debeBloquearIntentos(){IntentoCancelacion ultimo=new IntentoCancelacion(barberia,"huella",false);when(intentos.countByBarberiaIdAndHuellaOrigenAndExitosoFalseAndFechaIntentoAfter(eq(1L),anyString(),any())).thenReturn(5L);when(intentos.findTopByBarberiaIdAndHuellaOrigenAndExitosoFalseOrderByFechaIntentoDesc(eq(1L),anyString())).thenReturn(Optional.of(ultimo));assertThrows(LimiteIntentosSuperadoExcepcion.class,()->servicio.cancelar("mimi",new SolicitudCancelarCita("600123123","01234"),"127.0.0.1"));verifyNoInteractions(citas);}
 @Test @DisplayName("Debe impedir la cancelación pública dentro de las últimas 24 horas") void debeAplicarPlazo(){cita.setFechaInicio(LocalDateTime.now().plusHours(2));cita.setFechaFin(LocalDateTime.now().plusHours(2).plusMinutes(30));when(citas.findByBarberiaIdAndTelefonoClienteAndEstadoInAndAnonimizadaFalse(eq(1L),eq("600123123"),any())).thenReturn(List.of(cita));assertThrows(CancelacionNoPermitidaExcepcion.class,()->servicio.cancelar("mimi",new SolicitudCancelarCita("600123123","01234"),"127.0.0.1"));verifyNoInteractions(notificaciones);}
 private static void id(Object o,Long valor)throws Exception{Field f=o.getClass().getDeclaredField("id");f.setAccessible(true);f.set(o,valor);}
}
