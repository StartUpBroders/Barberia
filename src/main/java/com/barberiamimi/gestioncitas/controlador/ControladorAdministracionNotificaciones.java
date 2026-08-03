package com.barberiamimi.gestioncitas.controlador;
import com.barberiamimi.gestioncitas.dto.respuesta.NotificacionRespuesta;
import com.barberiamimi.gestioncitas.seguridad.UsuarioAutenticado;
import com.barberiamimi.gestioncitas.servicio.ServicioAdministracion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/administracion/notificaciones") @Tag(name="Notificaciones administrativas")
public class ControladorAdministracionNotificaciones {
 private final ServicioAdministracion servicio; public ControladorAdministracionNotificaciones(ServicioAdministracion s){servicio=s;}
 @GetMapping @Operation(summary="Listar notificaciones autorizadas") public List<NotificacionRespuesta> listar(@AuthenticationPrincipal UsuarioAutenticado u){return servicio.listarNotificaciones(u);}
 @PatchMapping("/{id}/leida") @Operation(summary="Marcar una notificación como leída") public NotificacionRespuesta marcar(@AuthenticationPrincipal UsuarioAutenticado u,@PathVariable Long id){return servicio.marcarLeida(u,id);}
}
