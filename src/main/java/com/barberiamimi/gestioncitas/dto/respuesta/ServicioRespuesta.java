package com.barberiamimi.gestioncitas.dto.respuesta;
import java.math.BigDecimal;
public record ServicioRespuesta(Long id,String nombre,String descripcion,BigDecimal precio,boolean activo) {}
