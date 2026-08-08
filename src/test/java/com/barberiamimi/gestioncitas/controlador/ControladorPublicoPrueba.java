package com.barberiamimi.gestioncitas.controlador;
import com.barberiamimi.gestioncitas.dto.respuesta.CitaCreadaRespuesta;
import com.barberiamimi.gestioncitas.enumeracion.EstadoCita;
import com.barberiamimi.gestioncitas.servicio.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ControladorPublico.class) @AutoConfigureMockMvc(addFilters=false)
class ControladorPublicoPrueba {
 @Autowired MockMvc mvc; @MockitoBean ServicioCatalogoPublico catalogo; @MockitoBean ServicioDisponibilidad disponibilidad; @MockitoBean ServicioCitas citas; @MockitoBean ServicioCancelacion cancelacion; @MockitoBean ServicioProteccionReservas proteccion;
 @Test @DisplayName("POST de cita válida debe aplicar el límite de intentos") void debeCrearCita()throws Exception{when(citas.crearPublica(eq("barberia-mimi"),eq("clave-1"),any())).thenReturn(new CitaCreadaRespuesta(1L,"Barbería Mimi","Mimi","Corte",new BigDecimal("15.00"),30,LocalDateTime.of(2030,9,10,10,0),LocalDateTime.of(2030,9,10,10,30),EstadoCita.CONFIRMADA,"01234","Creada",false));mvc.perform(post("/api/barberias/barberia-mimi/citas").header("Idempotency-Key","clave-1").header("CF-Connecting-IP","198.51.100.30").contentType(MediaType.APPLICATION_JSON).content("""
 {"nombreCliente":"Ana","telefonoCliente":"600123123","servicioId":1,"profesionalId":1,"fechaInicio":"2030-09-10T10:00:00"}
 """)).andExpect(status().isCreated()).andExpect(jsonPath("$.codigoCancelacion").value("01234"));verify(proteccion).validarIntento("barberia-mimi","198.51.100.30");}
 @Test @DisplayName("POST de cita inválida debe devolver 400") void debeRechazarCitaInvalida()throws Exception{mvc.perform(post("/api/barberias/barberia-mimi/citas").header("Idempotency-Key","clave-1").contentType(MediaType.APPLICATION_JSON).content("""
 {"nombreCliente":"","telefonoCliente":"60012312","servicioId":0,"profesionalId":1,"fechaInicio":"2020-01-01T10:00:00"}
 """)).andExpect(status().isBadRequest()).andExpect(jsonPath("$.codigo").value("DATOS_INVALIDOS"));verifyNoInteractions(citas);}
 @Test @DisplayName("Debe exponer catálogo y los dos formatos de disponibilidad") void debeExponerConsultasPublicas()throws Exception{mvc.perform(get("/api/barberias/barberia-mimi")).andExpect(status().isOk());mvc.perform(get("/api/barberias/barberia-mimi/servicios")).andExpect(status().isOk());mvc.perform(get("/api/barberias/barberia-mimi/profesionales")).andExpect(status().isOk());mvc.perform(get("/api/barberias/barberia-mimi/disponibilidad").param("profesionalId","1").param("servicioId","2").param("fecha","2030-09-10")).andExpect(status().isOk());mvc.perform(get("/api/barberias/barberia-mimi/calendario-disponibilidad").param("profesionalId","1").param("servicioId","2")).andExpect(status().isOk());mvc.perform(get("/api/barberias/barberia-mimi/calendario-disponibilidad").param("profesionalId","1")).andExpect(status().isOk());verify(catalogo).consultar("barberia-mimi");verify(disponibilidad).consultarCalendario("barberia-mimi",1L,2L);verify(disponibilidad).consultarCalendario("barberia-mimi",1L,null);}
 @Test @DisplayName("Debe exponer cancelación y obtener la IP reenviada") void debeCancelarConIpReenviada()throws Exception{mvc.perform(post("/api/barberias/barberia-mimi/citas/cancelacion").header("X-Forwarded-For","198.51.100.20, 10.0.0.1").contentType(MediaType.APPLICATION_JSON).content("""
 {"codigoCancelacion":"12345","telefonoCliente":"600123123"}
 """)).andExpect(status().isOk());verify(cancelacion).cancelar(eq("barberia-mimi"),any(),eq("198.51.100.20"));}
}
