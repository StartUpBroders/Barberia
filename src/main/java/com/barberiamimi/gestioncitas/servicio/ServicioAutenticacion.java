package com.barberiamimi.gestioncitas.servicio;

import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import com.barberiamimi.gestioncitas.dto.solicitud.SolicitudIniciarSesion;
import com.barberiamimi.gestioncitas.entidad.UsuarioAdministracion;
import com.barberiamimi.gestioncitas.excepcion.LimiteIntentosSuperadoExcepcion;
import com.barberiamimi.gestioncitas.repositorio.RepositorioUsuarioAdministracion;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class ServicioAutenticacion {
    private final AuthenticationManager gestor; private final RepositorioUsuarioAdministracion usuarios; private final PropiedadesAplicacion propiedades;
    public ServicioAutenticacion(AuthenticationManager g,RepositorioUsuarioAdministracion u,PropiedadesAplicacion p){gestor=g;usuarios=u;propiedades=p;}
    @Transactional(noRollbackFor = AuthenticationException.class) public Authentication autenticar(SolicitudIniciarSesion s){
        UsuarioAdministracion u=usuarios.findByNombreUsuario(s.nombreUsuario()).orElse(null);
        if(u!=null&&u.getFechaBloqueo()!=null&&u.getFechaBloqueo().isAfter(LocalDateTime.now()))throw new LimiteIntentosSuperadoExcepcion();
        try{Authentication a=gestor.authenticate(new UsernamePasswordAuthenticationToken(s.nombreUsuario(),s.contrasena()));if(u!=null){u.setIntentosFallidos(0);u.setFechaBloqueo(null);}return a;}
        catch(AuthenticationException e){if(u!=null){int fallos=u.getIntentosFallidos()+1;u.setIntentosFallidos(fallos);if(fallos>=propiedades.getAutenticacion().getMaximoIntentos())u.setFechaBloqueo(LocalDateTime.now().plusMinutes(propiedades.getAutenticacion().getBloqueoMinutos()));}throw e;}
    }
}
