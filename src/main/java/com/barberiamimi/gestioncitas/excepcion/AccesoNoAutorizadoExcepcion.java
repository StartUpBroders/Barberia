package com.barberiamimi.gestioncitas.excepcion;
import org.springframework.http.HttpStatus;
public class AccesoNoAutorizadoExcepcion extends ExcepcionApi { public AccesoNoAutorizadoExcepcion(String mensaje){super("ACCESO_NO_AUTORIZADO",mensaje,HttpStatus.FORBIDDEN);} }
