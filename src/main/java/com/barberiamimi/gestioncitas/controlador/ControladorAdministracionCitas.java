package com.barberiamimi.gestioncitas.controlador;

import com.barberiamimi.gestioncitas.dto.solicitud.*;
import com.barberiamimi.gestioncitas.dto.respuesta.*;
import com.barberiamimi.gestioncitas.excepcion.AccesoNoAutorizadoExcepcion;
import com.barberiamimi.gestioncitas.seguridad.UsuarioAutenticado;
import com.barberiamimi.gestioncitas.servicio.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/administracion/citas") @Tag(name="Citas administrativas",description="Requiere sesión y CSRF en operaciones de escritura")
public class ControladorAdministracionCitas {
    private final ServicioAdministracion administracion; private final ServicioCitas citas;
    public ControladorAdministracionCitas(ServicioAdministracion a,ServicioCitas c){administracion=a;citas=c;}
    @GetMapping @Operation(summary="Listar citas autorizadas") public List<CitaRespuesta> listar(@AuthenticationPrincipal UsuarioAutenticado u){return administracion.listarCitas(u);}
    @GetMapping("/{id}") @Operation(summary="Consultar una cita") public CitaRespuesta consultar(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id){return administracion.consultarCita(u,id);}
    @PostMapping @Operation(summary="Crear una cita manualmente") public ResponseEntity<CitaCreadaRespuesta> crear(@AuthenticationPrincipal UsuarioAutenticado u,@RequestHeader("Idempotency-Key") String clave,@Valid @RequestBody SolicitudCrearCitaAdministrativa solicitud){SolicitudCrearCita s=solicitud.normalizada();if(u.getProfesionalId()!=null&&!u.getProfesionalId().equals(s.profesionalId()))throw new AccesoNoAutorizadoExcepcion("No puedes crear citas para otro profesional.");return ResponseEntity.status(HttpStatus.CREATED).body(citas.crear(u.getBarberiaSlug(),clave,s));}
    @PutMapping("/{id}") @Operation(summary="Actualizar una cita") public CitaRespuesta actualizar(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id,@Valid @RequestBody SolicitudCrearCita s){return administracion.actualizarCita(u,id,s);}
    @PatchMapping("/{id}/estado") @Operation(summary="Cambiar el estado de una cita") public CitaRespuesta estado(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id,@Valid @RequestBody SolicitudCambiarEstadoCita s){return administracion.cambiarEstado(u,id,s);}
    @PostMapping("/{id}/cancelacion") @Operation(summary="Cancelar una cita sin restricción de 24 horas") public CitaRespuesta cancelar(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id,@RequestBody(required=false) SolicitudCambiarEstadoCita s){return administracion.cancelarCita(u,id,s==null?null:s.motivo());}
}
