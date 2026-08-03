package com.barberiamimi.gestioncitas.controlador;
import com.barberiamimi.gestioncitas.configuracion.*;
import com.barberiamimi.gestioncitas.servicio.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ControladorPublico.class) @Import(ConfiguracionSeguridad.class)
class SeguridadWebPrueba {
 @Autowired MockMvc mvc; @MockitoBean ServicioCatalogoPublico catalogo; @MockitoBean ServicioDisponibilidad disponibilidad; @MockitoBean ServicioCitas citas; @MockitoBean ServicioCancelacion cancelacion;
 @Test @DisplayName("Debe exigir CSRF incluso en escrituras públicas") void debeExigirCsrf()throws Exception{mvc.perform(post("/api/barberias/mimi/citas")).andExpect(status().isForbidden());}
 @Test @DisplayName("Debe permitir que una escritura pública llegue al controlador con CSRF") void debeAceptarCsrf()throws Exception{mvc.perform(post("/api/barberias/mimi/citas").with(csrf())).andExpect(status().isBadRequest());}
 @Test @DisplayName("Debe rechazar el acceso administrativo sin sesión") void debeExigirSesion()throws Exception{mvc.perform(get("/api/administracion/citas")).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));}
}
