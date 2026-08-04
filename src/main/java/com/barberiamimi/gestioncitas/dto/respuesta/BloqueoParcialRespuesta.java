package com.barberiamimi.gestioncitas.dto.respuesta;
import java.util.List;
public record BloqueoParcialRespuesta(DiaBloqueadoRespuesta bloqueo,int citasCanceladas,List<ContactoCitaAfectadaRespuesta> citasAfectadas,String mensaje) {}
