package com.barberiamimi.gestioncitas.excepcion;
import org.springframework.http.HttpStatus;
public class CancelacionNoPermitidaExcepcion extends ExcepcionApi { public CancelacionNoPermitidaExcepcion(String mensaje){super("CANCELACION_FUERA_DE_PLAZO",mensaje,HttpStatus.UNPROCESSABLE_ENTITY);} }
