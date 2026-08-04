package com.barberiamimi.gestioncitas.dto.respuesta;

import com.barberiamimi.gestioncitas.enumeracion.RolUsuario;

public record ProfesionalAdministracionRespuesta(Long id,String nombre,String alias,boolean activo,Long usuarioId,String nombreUsuario,RolUsuario rol) {}
