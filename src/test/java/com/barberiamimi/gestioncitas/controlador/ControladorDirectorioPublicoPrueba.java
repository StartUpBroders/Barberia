package com.barberiamimi.gestioncitas.controlador;

import com.barberiamimi.gestioncitas.dto.respuesta.BarberiaDirectorioRespuesta;
import com.barberiamimi.gestioncitas.servicio.ServicioCatalogoPublico;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ControladorDirectorioPublico.class)
@AutoConfigureMockMvc(addFilters = false)
class ControladorDirectorioPublicoPrueba {
    @Autowired MockMvc mvc;
    @MockitoBean ServicioCatalogoPublico catalogo;

    @Test
    @DisplayName("Debe listar las barberías activas del directorio")
    void debeListarBarberias() throws Exception {
        when(catalogo.listarBarberias()).thenReturn(List.of(new BarberiaDirectorioRespuesta(1L, "Barbería Mimi", "barberia-mimi")));
        mvc.perform(get("/api/barberias"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].nombre").value("Barbería Mimi"))
            .andExpect(jsonPath("$[0].slug").value("barberia-mimi"));
    }
}
