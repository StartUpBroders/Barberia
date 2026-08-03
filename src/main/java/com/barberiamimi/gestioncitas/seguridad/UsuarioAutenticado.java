package com.barberiamimi.gestioncitas.seguridad;

import com.barberiamimi.gestioncitas.enumeracion.RolUsuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;

public class UsuarioAutenticado implements UserDetails, Serializable {
    private final Long id; private final Long barberiaId; private final String barberiaNombre; private final String barberiaSlug;
    private final Long profesionalId; private final String profesionalNombre; private final String usuario; private final String contrasena; private final RolUsuario rol; private final boolean activo; private final boolean noBloqueado;
    public UsuarioAutenticado(Long id,Long bid,String bn,String bs,Long pid,String pn,String u,String c,RolUsuario r,boolean activo,boolean noBloqueado){this.id=id;barberiaId=bid;barberiaNombre=bn;barberiaSlug=bs;profesionalId=pid;profesionalNombre=pn;usuario=u;contrasena=c;rol=r;this.activo=activo;this.noBloqueado=noBloqueado;}
    public Long getId(){return id;} public Long getBarberiaId(){return barberiaId;} public String getBarberiaNombre(){return barberiaNombre;} public String getBarberiaSlug(){return barberiaSlug;}
    public Long getProfesionalId(){return profesionalId;} public String getProfesionalNombre(){return profesionalNombre;} public RolUsuario getRol(){return rol;}
    @Override public Collection<? extends GrantedAuthority> getAuthorities(){return List.of(new SimpleGrantedAuthority("ROLE_"+rol.name()));}
    @Override public String getPassword(){return contrasena;} @Override public String getUsername(){return usuario;}
    @Override public boolean isAccountNonExpired(){return true;} @Override public boolean isAccountNonLocked(){return noBloqueado;}
    @Override public boolean isCredentialsNonExpired(){return true;} @Override public boolean isEnabled(){return activo;}
}
