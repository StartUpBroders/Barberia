package com.barberiamimi.gestioncitas.seguridad;

import com.barberiamimi.gestioncitas.dto.respuesta.ErrorRespuesta;
import com.barberiamimi.gestioncitas.repositorio.RepositorioUsuarioAdministracion;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class FiltroUsuarioActivo extends OncePerRequestFilter {
    private final ObjectProvider<RepositorioUsuarioAdministracion> proveedorUsuarios;
    private final ObjectMapper json;

    public FiltroUsuarioActivo(ObjectProvider<RepositorioUsuarioAdministracion> proveedorUsuarios,ObjectMapper json){this.proveedorUsuarios=proveedorUsuarios;this.json=json;}

    @Override
    protected void doFilterInternal(HttpServletRequest solicitud,HttpServletResponse respuesta,FilterChain cadena) throws ServletException,IOException {
        Authentication autenticacion=SecurityContextHolder.getContext().getAuthentication();
        RepositorioUsuarioAdministracion usuarios=proveedorUsuarios.getIfAvailable();
        if(usuarios!=null&&solicitud.getRequestURI().startsWith("/api/administracion/")&&autenticacion!=null&&autenticacion.getPrincipal() instanceof UsuarioAutenticado usuario&&!usuarios.estaActivo(usuario.getId(),usuario.getBarberiaId())){
            if(solicitud.getSession(false)!=null)solicitud.getSession(false).invalidate();
            SecurityContextHolder.clearContext();
            respuesta.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            respuesta.setContentType(MediaType.APPLICATION_JSON_VALUE);
            json.writeValue(respuesta.getOutputStream(),new ErrorRespuesta("USUARIO_INACTIVO","El acceso de este empleado está deshabilitado.",List.of(),LocalDateTime.now(),solicitud.getRequestURI()));
            return;
        }
        cadena.doFilter(solicitud,respuesta);
    }
}
