package com.barberiamimi.gestioncitas.dto.respuesta;
import com.barberiamimi.gestioncitas.enumeracion.RolUsuario;
public record SesionRespuesta(boolean autenticado,String usuario,RolUsuario rol,BarberiaRespuesta barberia,ProfesionalRespuesta profesional) {}
