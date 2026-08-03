package com.barberiamimi.gestioncitas.dto.respuesta;
import java.time.LocalDateTime;
import java.util.List;
public record ErrorRespuesta(String codigo, String mensaje, List<String> detalles, LocalDateTime marcaTemporal, String ruta) {}
