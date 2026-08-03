package com.barberiamimi.gestioncitas.excepcion;
import org.springframework.http.HttpStatus;
public class SolicitudInvalidaExcepcion extends ExcepcionApi { public SolicitudInvalidaExcepcion(String mensaje){super("SOLICITUD_INVALIDA",mensaje,HttpStatus.BAD_REQUEST);} }
