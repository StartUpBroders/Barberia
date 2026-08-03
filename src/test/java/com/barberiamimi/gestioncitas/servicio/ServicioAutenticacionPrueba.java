package com.barberiamimi.gestioncitas.servicio;
import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import com.barberiamimi.gestioncitas.dto.solicitud.SolicitudIniciarSesion;
import com.barberiamimi.gestioncitas.entidad.*;
import com.barberiamimi.gestioncitas.enumeracion.RolUsuario;
import com.barberiamimi.gestioncitas.repositorio.RepositorioUsuarioAdministracion;
import org.junit.jupiter.api.*;
import org.springframework.security.authentication.*;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ServicioAutenticacionPrueba {
 @Test @DisplayName("Debe reiniciar los intentos tras un inicio de sesión correcto") void debeReiniciarIntentos(){AuthenticationManager gestor=mock(AuthenticationManager.class);RepositorioUsuarioAdministracion repo=mock(RepositorioUsuarioAdministracion.class);UsuarioAdministracion u=new UsuarioAdministracion(new Barberia("Mimi","mimi"),null,"mimi","hash",RolUsuario.PROPIETARIO);u.setIntentosFallidos(3);when(repo.findByNombreUsuario("mimi")).thenReturn(Optional.of(u));var autenticacion=new UsernamePasswordAuthenticationToken("mimi","secreto");when(gestor.authenticate(any())).thenReturn(autenticacion);var resultado=new ServicioAutenticacion(gestor,repo,new PropiedadesAplicacion()).autenticar(new SolicitudIniciarSesion("mimi","secreto"));assertSame(autenticacion,resultado);assertEquals(0,u.getIntentosFallidos());assertNull(u.getFechaBloqueo());}
 @Test @DisplayName("Debe contar y bloquear los inicios de sesión fallidos") void debeContarFallos(){AuthenticationManager gestor=mock(AuthenticationManager.class);RepositorioUsuarioAdministracion repo=mock(RepositorioUsuarioAdministracion.class);UsuarioAdministracion u=new UsuarioAdministracion(new Barberia("Mimi","mimi"),null,"mimi","hash",RolUsuario.PROPIETARIO);u.setIntentosFallidos(4);when(repo.findByNombreUsuario("mimi")).thenReturn(Optional.of(u));when(gestor.authenticate(any())).thenThrow(new BadCredentialsException("fallo"));assertThrows(BadCredentialsException.class,()->new ServicioAutenticacion(gestor,repo,new PropiedadesAplicacion()).autenticar(new SolicitudIniciarSesion("mimi","incorrecta")));assertEquals(5,u.getIntentosFallidos());assertNotNull(u.getFechaBloqueo());}
}
