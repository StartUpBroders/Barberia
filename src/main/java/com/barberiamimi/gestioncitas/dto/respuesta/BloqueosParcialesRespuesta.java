package com.barberiamimi.gestioncitas.dto.respuesta;
import java.util.List;
public record BloqueosParcialesRespuesta(List<DiaBloqueadoRespuesta> bloqueos,int citasCanceladas,List<ContactoCitaAfectadaRespuesta> citasAfectadas,String mensaje) {}
