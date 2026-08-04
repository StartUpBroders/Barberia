package com.barberiamimi.gestioncitas.entidad;

import com.barberiamimi.gestioncitas.enumeracion.RolUsuario;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="usuarios_administracion")
public class UsuarioAdministracion extends EntidadAuditable {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="barberia_id", nullable=false) private Barberia barberia;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="profesional_id") private Profesional profesional;
    @Column(name="nombre_usuario", nullable=false, unique=true, length=80) private String nombreUsuario;
    @Column(name="contrasena_hash", nullable=false, length=100) private String contrasenaHash;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private RolUsuario rol;
    @Column(nullable=false) private boolean activo=true;
    @Column(name="intentos_fallidos", nullable=false) private int intentosFallidos;
    @Column(name="fecha_bloqueo") private LocalDateTime fechaBloqueo;
    protected UsuarioAdministracion() {}
    public UsuarioAdministracion(Barberia b,Profesional p,String nombre,String hash,RolUsuario rol){barberia=b;profesional=p;nombreUsuario=nombre;contrasenaHash=hash;this.rol=rol;}
    public Long getId(){return id;} public Barberia getBarberia(){return barberia;} public Profesional getProfesional(){return profesional;}
    public String getNombreUsuario(){return nombreUsuario;} public String getContrasenaHash(){return contrasenaHash;}
    public void setNombreUsuario(String v){nombreUsuario=v;} public void setContrasenaHash(String v){contrasenaHash=v;} public RolUsuario getRol(){return rol;} public boolean isActivo(){return activo;} public void setActivo(boolean v){activo=v;}
    public int getIntentosFallidos(){return intentosFallidos;} public void setIntentosFallidos(int v){intentosFallidos=v;}
    public LocalDateTime getFechaBloqueo(){return fechaBloqueo;} public void setFechaBloqueo(LocalDateTime v){fechaBloqueo=v;}
}
