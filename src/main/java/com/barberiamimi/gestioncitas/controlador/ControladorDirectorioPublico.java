package com.barberiamimi.gestioncitas.controlador;

import com.barberiamimi.gestioncitas.dto.respuesta.BarberiaDirectorioRespuesta;
import com.barberiamimi.gestioncitas.servicio.ServicioCatalogoPublico;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/barberias")
@Tag(name = "Directorio público", description = "Barberías activas disponibles en la plataforma")
public class ControladorDirectorioPublico {
    private final ServicioCatalogoPublico catalogo;

    public ControladorDirectorioPublico(ServicioCatalogoPublico catalogo) {
        this.catalogo = catalogo;
    }

    @GetMapping
    @Operation(summary = "Listar barberías activas")
    public List<BarberiaDirectorioRespuesta> listar() {
        return catalogo.listarBarberias();
    }
}
