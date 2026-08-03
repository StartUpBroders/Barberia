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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ControladorPublico.class) @AutoConfigureMockMvc(addFilters=false)
class ControladorPublicoPrueba {
 @Autowired MockMvc mvc; @MockitoBean ServicioCatalogoPublico catalogo; @MockitoBean ServicioDisponibilidad disponibilidad; @MockitoBean ServicioCitas citas; @MockitoBean ServicioCancelacion cancelacion;
 @Test @DisplayName("POST de cita válida debe devolver 201") void debeCrearCita()throws Exception{when(citas.crear(eq("barberia-mimi"),eq("clave-1"),any())).thenReturn(new CitaCreadaRespuesta(1L,"Barbería Mimi","Mimi","Corte",new BigDecimal("15.00"),30,LocalDateTime.of(2030,9,10,10,0),LocalDateTime.of(2030,9,10,10,30),EstadoCita.CONFIRMADA,"01234","Creada",false));mvc.perform(post("/api/barberias/barberia-mimi/citas").header("Idempotency-Key","clave-1").contentType(MediaType.APPLICATION_JSON).content("""
 {"nombreCliente":"Ana","telefonoCliente":"600123123","correoCliente":"ana@example.com","servicioId":1,"profesionalId":1,"fechaInicio":"2030-09-10T10:00:00"}
 """)).andExpect(status().isCreated()).andExpect(jsonPath("$.codigoCancelacion").value("01234"));}
 @Test @DisplayName("POST de cita inválida debe devolver 400") void debeRechazarCitaInvalida()throws Exception{mvc.perform(post("/api/barberias/barberia-mimi/citas").header("Idempotency-Key","clave-1").contentType(MediaType.APPLICATION_JSON).content("""
 {"nombreCliente":"","telefonoCliente":"x","servicioId":0,"profesionalId":1,"fechaInicio":"2020-01-01T10:00:00"}
 """)).andExpect(status().isBadRequest()).andExpect(jsonPath("$.codigo").value("DATOS_INVALIDOS"));verifyNoInteractions(citas);}
}
