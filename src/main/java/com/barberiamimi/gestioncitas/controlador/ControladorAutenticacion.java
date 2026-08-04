package com.barberiamimi.gestioncitas.controlador;

import com.barberiamimi.gestioncitas.dto.solicitud.SolicitudIniciarSesion;
import com.barberiamimi.gestioncitas.dto.respuesta.*;
import com.barberiamimi.gestioncitas.seguridad.UsuarioAutenticado;
import com.barberiamimi.gestioncitas.servicio.ServicioAutenticacion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import org.springframework.security.core.*;
import org.springframework.security.core.context.*;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/autenticacion") @Tag(name="Autenticación",description="Sesión administrativa y protección CSRF")
public class ControladorAutenticacion {
    private final ServicioAutenticacion servicio; private final HttpSessionSecurityContextRepository repositorioContexto=new HttpSessionSecurityContextRepository();
    public ControladorAutenticacion(ServicioAutenticacion s){servicio=s;}
    @PostMapping("/iniciar-sesion") @Operation(summary="Iniciar sesión administrativa") public SesionRespuesta iniciar(@Valid @RequestBody SolicitudIniciarSesion solicitud,HttpServletRequest peticion,HttpServletResponse respuesta){Authentication a=servicio.autenticar(solicitud);SecurityContext contexto=SecurityContextHolder.createEmptyContext();contexto.setAuthentication(a);SecurityContextHolder.setContext(contexto);peticion.getSession(true);peticion.changeSessionId();repositorioContexto.saveContext(contexto,peticion,respuesta);return convertir((UsuarioAutenticado)a.getPrincipal());}
    @PostMapping("/cerrar-sesion") @Operation(summary="Cerrar e invalidar la sesión") public MensajeRespuesta cerrar(Authentication a,HttpServletRequest p,HttpServletResponse r){new SecurityContextLogoutHandler().logout(p,r,a);return new MensajeRespuesta("SESION_CERRADA","La sesión se ha cerrado correctamente.");}
    @GetMapping("/sesion") @Operation(summary="Consultar la sesión actual") public SesionRespuesta sesion(Authentication a){return convertir((UsuarioAutenticado)a.getPrincipal());}
    @GetMapping("/csrf") @Operation(summary="Obtener el token CSRF") public CsrfRespuesta csrf(CsrfToken token){return new CsrfRespuesta(token.getHeaderName(),token.getParameterName(),token.getToken());}
    private SesionRespuesta convertir(UsuarioAutenticado u){return new SesionRespuesta(true,u.getUsername(),u.getRol(),new BarberiaRespuesta(u.getBarberiaId(),u.getBarberiaNombre(),u.getBarberiaSlug(),null,null,null,null,false,true,30,30),u.getProfesionalId()==null?null:new ProfesionalRespuesta(u.getProfesionalId(),u.getProfesionalNombre(),u.getProfesionalAlias(),true));}
}
