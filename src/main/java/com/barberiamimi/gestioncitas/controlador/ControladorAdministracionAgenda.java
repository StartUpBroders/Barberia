package com.barberiamimi.gestioncitas.controlador;
import com.barberiamimi.gestioncitas.dto.solicitud.*;
import com.barberiamimi.gestioncitas.dto.respuesta.*;
import com.barberiamimi.gestioncitas.seguridad.UsuarioAutenticado;
import com.barberiamimi.gestioncitas.servicio.ServicioAdministracion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/administracion") @Tag(name="Agenda administrativa")
public class ControladorAdministracionAgenda {
 private final ServicioAdministracion servicio; public ControladorAdministracionAgenda(ServicioAdministracion s){servicio=s;}
 @GetMapping("/horarios") @Operation(summary="Listar horarios autorizados") public List<HorarioRespuesta> horarios(@AuthenticationPrincipal UsuarioAutenticado u){return servicio.listarHorarios(u);}
 @PostMapping("/horarios") @Operation(summary="Crear un horario") public ResponseEntity<HorarioRespuesta> crearHorario(@AuthenticationPrincipal UsuarioAutenticado u,@Valid @RequestBody SolicitudHorario s){return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crearHorario(u,s));}
 @PutMapping("/horarios/{id}") @Operation(summary="Actualizar un horario") public HorarioRespuesta actualizarHorario(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id,@Valid @RequestBody SolicitudHorario s){return servicio.actualizarHorario(u,id,s);}
 @DeleteMapping("/horarios/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary="Eliminar un horario") public void eliminarHorario(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id){servicio.eliminarHorario(u,id);}
 @GetMapping("/dias-bloqueados") @Operation(summary="Listar días y franjas bloqueados") public List<DiaBloqueadoRespuesta> dias(@AuthenticationPrincipal UsuarioAutenticado u){return servicio.listarDias(u);}
 @PostMapping("/dias-bloqueados") @Operation(summary="Crear un bloqueo") public ResponseEntity<DiaBloqueadoRespuesta> crearDia(@AuthenticationPrincipal UsuarioAutenticado u,@Valid @RequestBody SolicitudDiaBloqueado s){return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crearDia(u,s));}
 @PutMapping("/dias-bloqueados/{id}") @Operation(summary="Actualizar un bloqueo") public DiaBloqueadoRespuesta actualizarDia(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id,@Valid @RequestBody SolicitudDiaBloqueado s){return servicio.actualizarDia(u,id,s);}
 @DeleteMapping("/dias-bloqueados/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary="Eliminar un bloqueo") public void eliminarDia(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id){servicio.eliminarDia(u,id);}
}
