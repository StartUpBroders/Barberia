package com.barberiamimi.gestioncitas.controlador;
import com.barberiamimi.gestioncitas.dto.solicitud.SolicitudIniciarSesion;
import com.barberiamimi.gestioncitas.enumeracion.RolUsuario;
import com.barberiamimi.gestioncitas.seguridad.UsuarioAutenticado;
import com.barberiamimi.gestioncitas.servicio.ServicioAutenticacion;
import org.junit.jupiter.api.*;
import org.springframework.mock.web.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.csrf.CsrfToken;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ControladorAutenticacionPrueba {
 @Test @DisplayName("Debe crear, consultar y cerrar una sesión sin exponer secretos") void debeGestionarSesion(){ServicioAutenticacion servicio=mock(ServicioAutenticacion.class);UsuarioAutenticado usuario=new UsuarioAutenticado(1L,2L,"Mimi","mimi",3L,"Mimi","mimi","duena","hash",RolUsuario.PROPIETARIO,true,true);var autenticacion=new UsernamePasswordAuthenticationToken(usuario,null,usuario.getAuthorities());when(servicio.autenticar(any())).thenReturn(autenticacion);ControladorAutenticacion controlador=new ControladorAutenticacion(servicio);MockHttpServletRequest peticion=new MockHttpServletRequest();MockHttpServletResponse respuesta=new MockHttpServletResponse();var sesion=controlador.iniciar(new SolicitudIniciarSesion("duena","contrasena-segura"),peticion,respuesta);assertTrue(sesion.autenticado());assertEquals("duena",sesion.usuario());assertEquals("mimi",sesion.barberia().slug());assertEquals("mimi",sesion.profesional().alias());assertEquals("duena",controlador.sesion(autenticacion).usuario());assertEquals("SESION_CERRADA",controlador.cerrar(autenticacion,peticion,respuesta).codigo());}
 @Test @DisplayName("Debe devolver los nombres y el valor del token CSRF") void debeDevolverCsrf(){CsrfToken token=mock(CsrfToken.class);when(token.getHeaderName()).thenReturn("X-XSRF-TOKEN");when(token.getParameterName()).thenReturn("_csrf");when(token.getToken()).thenReturn("valor");var r=new ControladorAutenticacion(mock(ServicioAutenticacion.class)).csrf(token);assertEquals("X-XSRF-TOKEN",r.cabecera());assertEquals("valor",r.token());}
}
