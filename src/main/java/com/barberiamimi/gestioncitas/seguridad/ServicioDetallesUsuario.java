package com.barberiamimi.gestioncitas.seguridad;

import com.barberiamimi.gestioncitas.entidad.UsuarioAdministracion;
import com.barberiamimi.gestioncitas.repositorio.RepositorioUsuarioAdministracion;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class ServicioDetallesUsuario implements UserDetailsService {
    private final RepositorioUsuarioAdministracion usuarios;
    public ServicioDetallesUsuario(RepositorioUsuarioAdministracion u){usuarios=u;}
    @Override @Transactional(readOnly=true) public UserDetails loadUserByUsername(String nombre){UsuarioAdministracion u=usuarios.findByNombreUsuario(nombre.trim().toLowerCase(java.util.Locale.ROOT)).orElseThrow(()->new UsernameNotFoundException("Credenciales no válidas."));boolean noBloqueado=u.getFechaBloqueo()==null||u.getFechaBloqueo().isBefore(LocalDateTime.now());return new UsuarioAutenticado(u.getId(),u.getBarberia().getId(),u.getBarberia().getNombre(),u.getBarberia().getSlug(),u.getProfesional()==null?null:u.getProfesional().getId(),u.getProfesional()==null?null:u.getProfesional().getNombre(),u.getProfesional()==null?null:u.getProfesional().getAlias(),u.getNombreUsuario(),u.getContrasenaHash(),u.getRol(),u.isActivo(),noBloqueado);}
}
