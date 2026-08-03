package com.barberiamimi.gestioncitas.dto.respuesta;
import com.barberiamimi.gestioncitas.enumeracion.RolUsuario;
public record UsuarioRespuesta(Long id,String nombreUsuario,RolUsuario rol,Long profesionalId,boolean activo) {}
