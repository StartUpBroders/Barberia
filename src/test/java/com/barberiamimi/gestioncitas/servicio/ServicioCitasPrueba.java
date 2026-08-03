package com.barberiamimi.gestioncitas.servicio;
import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import com.barberiamimi.gestioncitas.dto.solicitud.SolicitudCrearCita;
import com.barberiamimi.gestioncitas.entidad.*;
import com.barberiamimi.gestioncitas.excepcion.RecursoDuplicadoExcepcion;
import com.barberiamimi.gestioncitas.repositorio.*;
import com.barberiamimi.gestioncitas.utilidad.UtilidadCriptografica;
import org.junit.jupiter.api.*;
import org.mockito.*;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ServicioCitasPrueba {
 @Mock ServicioCatalogoPublico catalogo; @Mock RepositorioServicio servicios; @Mock RepositorioProfesional profesionales; @Mock RepositorioCita citas; @Mock ServicioDisponibilidad disponibilidad;
 private AutoCloseable mocks; private ServicioCitas servicio; private Barberia barberia; private Servicio corte; private Profesional mimi;
 @BeforeEach void preparar()throws Exception{mocks=MockitoAnnotations.openMocks(this);PropiedadesAplicacion p=new PropiedadesAplicacion();p.getCancelacion().setSecretoHmac("secreto-de-prueba-muy-largo-123456");servicio=new ServicioCitas(catalogo,servicios,profesionales,citas,disponibilidad,new UtilidadCriptografica(),p);barberia=new Barberia("Barbería Mimi","barberia-mimi");ponerId(barberia,1L);corte=new Servicio(barberia,"Corte",null,new BigDecimal("15.00"),30);ponerId(corte,1L);mimi=new Profesional(barberia,"Mimi","mimi");ponerId(mimi,1L);when(catalogo.buscarBarberia("barberia-mimi")).thenReturn(barberia);when(servicios.findByIdAndBarberiaIdAndActivoTrue(1L,1L)).thenReturn(Optional.of(corte));when(profesionales.findByIdAndBarberiaIdAndActivoTrue(1L,1L)).thenReturn(Optional.of(mimi));when(citas.findByBarberiaIdAndClaveIdempotencia(anyLong(),anyString())).thenReturn(Optional.empty());doAnswer(i->{ponerId(i.getArgument(0),25L);return i.getArgument(0);}).when(citas).saveAndFlush(any(Cita.class));}
 @AfterEach void cerrar()throws Exception{mocks.close();}
 @Test @DisplayName("Debe crear una cita y guardar el código únicamente como HMAC") void debeCrearCita() {var r=servicio.crear("barberia-mimi","peticion-1",solicitud());assertEquals(25L,r.id());assertTrue(r.codigoCancelacion().matches("[0-9]{5}"));ArgumentCaptor<Cita> captor=ArgumentCaptor.forClass(Cita.class);verify(citas).save(captor.capture());assertNotEquals(r.codigoCancelacion(),captor.getValue().getCodigoCancelacionHmac());assertEquals(64,captor.getValue().getCodigoCancelacionHmac().length());assertEquals("Corte",captor.getValue().getNombreServicioReservado());assertEquals(new BigDecimal("15.00"),captor.getValue().getPrecioServicioReservado());}
 @Test @DisplayName("Debe devolver la misma cita ante un reintento idempotente") void debeRespetarIdempotencia()throws Exception{SolicitudCrearCita s=solicitud();var primera=servicio.crear("barberia-mimi","peticion-1",s);Cita guardada=new Cita(barberia,mimi,corte,s.nombreCliente(),s.telefonoCliente(),s.correoCliente(),s.fechaInicio(),s.fechaInicio().plusMinutes(30),s.notaCliente(),"hmac","peticion-1",capturarHuella());ponerId(guardada,primera.id());when(citas.findByBarberiaIdAndClaveIdempotencia(1L,"peticion-1")).thenReturn(Optional.of(guardada));var repetida=servicio.crear("barberia-mimi","peticion-1",s);assertEquals(primera.id(),repetida.id());assertTrue(repetida.repetida());assertNull(repetida.codigoCancelacion());verify(citas,times(1)).saveAndFlush(any());}
 @Test @DisplayName("Debe rechazar una clave de idempotencia reutilizada con otros datos") void debeRechazarReutilizacionIncorrecta()throws Exception{Cita anterior=new Cita(barberia,mimi,corte,"Otro","600111111",null,LocalDateTime.now().plusDays(3),LocalDateTime.now().plusDays(3).plusMinutes(30),null,"h","clave","otra-huella");ponerId(anterior,9L);when(citas.findByBarberiaIdAndClaveIdempotencia(1L,"clave")).thenReturn(Optional.of(anterior));assertThrows(RecursoDuplicadoExcepcion.class,()->servicio.crear("barberia-mimi","clave",solicitud()));}
 private SolicitudCrearCita solicitud(){return new SolicitudCrearCita("Ana","600123123","ana@example.com",1L,1L,LocalDateTime.of(2030,9,10,10,0),"Nota");}
 private String capturarHuella(){UtilidadCriptografica u=new UtilidadCriptografica();SolicitudCrearCita s=solicitud();return u.sha256(String.join("|",s.nombreCliente(),s.telefonoCliente(),String.valueOf(s.correoCliente()),s.servicioId().toString(),s.profesionalId().toString(),s.fechaInicio().toString(),String.valueOf(s.notaCliente())));}
 private static void ponerId(Object o,Long id)throws Exception{Field f=o.getClass().getDeclaredField("id");f.setAccessible(true);f.set(o,id);}
}
