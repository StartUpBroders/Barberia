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

@RestController @RequestMapping("/api/administracion") @Tag(name="Catálogo administrativo")
public class ControladorAdministracionCatalogo {
 private final ServicioAdministracion servicio; public ControladorAdministracionCatalogo(ServicioAdministracion s){servicio=s;}
 @GetMapping("/perfil") @Operation(summary="Consultar el perfil público de la barbería") public BarberiaRespuesta perfil(@AuthenticationPrincipal UsuarioAutenticado u){return servicio.consultarPerfilBarberia(u);}
 @PutMapping("/perfil") @Operation(summary="Actualizar el perfil público de la barbería (PROPIETARIO)") public BarberiaRespuesta actualizarPerfil(@AuthenticationPrincipal UsuarioAutenticado u,@Valid @RequestBody SolicitudPerfilBarberia s){return servicio.actualizarPerfilBarberia(u,s);}
 @GetMapping("/servicios") @Operation(summary="Listar todos los servicios") public List<ServicioRespuesta> servicios(@AuthenticationPrincipal UsuarioAutenticado u){return servicio.listarServicios(u);}
 @PostMapping("/servicios") @Operation(summary="Crear un servicio (PROPIETARIO)") public ResponseEntity<ServicioRespuesta> crearServicio(@AuthenticationPrincipal UsuarioAutenticado u,@Valid @RequestBody SolicitudServicio s){return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crearServicio(u,s));}
 @PutMapping("/servicios/{id}") @Operation(summary="Actualizar un servicio (PROPIETARIO)") public ServicioRespuesta actualizarServicio(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id,@Valid @RequestBody SolicitudServicio s){return servicio.actualizarServicio(u,id,s);}
 @PatchMapping("/servicios/{id}/estado") @Operation(summary="Activar o desactivar un servicio (PROPIETARIO)") public ServicioRespuesta estadoServicio(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id,@Valid @RequestBody SolicitudEstadoActivo s){return servicio.estadoServicio(u,id,s.activo());}
 @DeleteMapping("/servicios/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary="Eliminar definitivamente un servicio sin citas asociadas (PROPIETARIO)") public void eliminarServicio(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id){servicio.eliminarServicio(u,id);}
 @GetMapping("/profesionales") @Operation(summary="Listar profesionales y sus accesos") public List<ProfesionalAdministracionRespuesta> profesionales(@AuthenticationPrincipal UsuarioAutenticado u){return servicio.listarProfesionales(u);}
 @GetMapping("/equipo") @Operation(summary="Listar profesionales activos visibles en los calendarios") public List<ProfesionalRespuesta> equipo(@AuthenticationPrincipal UsuarioAutenticado u){return servicio.listarEquipo(u);}
 @PostMapping("/profesionales") @Operation(summary="Crear un profesional con acceso de empleado (PROPIETARIO)") public ResponseEntity<ProfesionalAdministracionRespuesta> crearProfesional(@AuthenticationPrincipal UsuarioAutenticado u,@Valid @RequestBody SolicitudCrearProfesional s){return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crearProfesional(u,s));}
 @PutMapping("/profesionales/{id}") @Operation(summary="Actualizar un profesional y su acceso (PROPIETARIO)") public ProfesionalAdministracionRespuesta actualizarProfesional(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id,@Valid @RequestBody SolicitudActualizarProfesional s){return servicio.actualizarProfesional(u,id,s);}
 @PatchMapping("/profesionales/{id}/estado") @Operation(summary="Activar o desactivar un profesional y su acceso (PROPIETARIO)") public ProfesionalAdministracionRespuesta estadoProfesional(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id,@Valid @RequestBody SolicitudEstadoActivo s){return servicio.estadoProfesional(u,id,s.activo());}
 @DeleteMapping("/profesionales/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary="Eliminar definitivamente un empleado y todos sus datos relacionados (PROPIETARIO)") public void eliminarProfesional(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id){servicio.eliminarProfesional(u,id);}
 @PostMapping("/usuarios") @Operation(summary="Crear un usuario de la barbería (PROPIETARIO)") public ResponseEntity<UsuarioRespuesta> crearUsuario(@AuthenticationPrincipal UsuarioAutenticado u,@Valid @RequestBody SolicitudCrearUsuario s){return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crearUsuario(u,s));}
 @PatchMapping("/usuarios/{id}/contrasena") @Operation(summary="Cambiar la contraseña de un usuario (PROPIETARIO)") public MensajeRespuesta cambiarContrasena(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id,@Valid @RequestBody SolicitudCambiarContrasena s){return servicio.cambiarContrasena(u,id,s);}
}
