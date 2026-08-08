package com.barberiamimi.gestioncitas.controlador;

import com.barberiamimi.gestioncitas.dto.solicitud.*;
import com.barberiamimi.gestioncitas.dto.respuesta.*;
import com.barberiamimi.gestioncitas.servicio.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController @RequestMapping("/api/barberias/{slug}") @Validated
@Tag(name="API pública",description="Consulta del catálogo, disponibilidad, reserva y cancelación sin autenticación")
public class ControladorPublico {
    private final ServicioCatalogoPublico catalogo; private final ServicioDisponibilidad disponibilidad; private final ServicioCitas citas; private final ServicioCancelacion cancelacion; private final ServicioProteccionReservas proteccion;
    public ControladorPublico(ServicioCatalogoPublico c,ServicioDisponibilidad d,ServicioCitas ci,ServicioCancelacion ca,ServicioProteccionReservas pr){catalogo=c;disponibilidad=d;citas=ci;cancelacion=ca;proteccion=pr;}
    @GetMapping @Operation(summary="Consultar una barbería activa") public BarberiaRespuesta consultar(@PathVariable @Pattern(regexp="^[a-z0-9]+(?:-[a-z0-9]+)*$") String slug){return catalogo.consultar(slug);}
    @GetMapping("/servicios") @Operation(summary="Listar servicios activos") public List<ServicioRespuesta> servicios(@PathVariable String slug){return catalogo.listarServicios(slug);}
    @GetMapping("/profesionales") @Operation(summary="Listar profesionales activos") public List<ProfesionalRespuesta> profesionales(@PathVariable String slug){return catalogo.listarProfesionales(slug);}
    @GetMapping("/disponibilidad") @Operation(summary="Consultar horarios disponibles") public DisponibilidadRespuesta disponibilidad(@PathVariable String slug,@RequestParam @Positive Long profesionalId,@RequestParam @Positive Long servicioId,@RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate fecha){return disponibilidad.consultar(slug,profesionalId,servicioId,fecha);}
    @GetMapping("/calendario-disponibilidad") @Operation(summary="Consultar el calendario completo de reserva") public CalendarioDisponibilidadRespuesta calendario(@PathVariable String slug,@RequestParam @Positive Long profesionalId,@RequestParam(required=false) @Positive Long servicioId){return disponibilidad.consultarCalendario(slug,profesionalId,servicioId);}
    @PostMapping("/citas") @Operation(summary="Crear una cita",description="Idempotency-Key es obligatoria. El código de cancelación solo se entrega en la primera respuesta.")
    public ResponseEntity<CitaCreadaRespuesta> crear(@PathVariable String slug,@Parameter(description="Clave única del intento de reserva",required=true) @RequestHeader("Idempotency-Key") String clave,@Valid @RequestBody SolicitudCrearCita solicitud,HttpServletRequest peticion){proteccion.validarIntento(slug,obtenerIp(peticion));CitaCreadaRespuesta r=citas.crearPublica(slug,clave,solicitud);return ResponseEntity.status(r.repetida()?HttpStatus.OK:HttpStatus.CREATED).body(r);}
    @PostMapping("/citas/cancelacion") @Operation(summary="Cancelar una cita como cliente") public MensajeRespuesta cancelar(@PathVariable String slug,@Valid @RequestBody SolicitudCancelarCita solicitud,HttpServletRequest peticion){return cancelacion.cancelar(slug,solicitud,obtenerIp(peticion));}
    private String obtenerIp(HttpServletRequest p){String cloudflare=p.getHeader("CF-Connecting-IP");if(cloudflare!=null&&!cloudflare.isBlank())return cloudflare.trim();String reenviada=p.getHeader("X-Forwarded-For");return reenviada==null?p.getRemoteAddr():reenviada.split(",")[0].trim();}
}
