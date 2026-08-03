package com.barberiamimi.gestioncitas.excepcion;
import org.springframework.http.HttpStatus;
public class CodigoCancelacionIncorrectoExcepcion extends ExcepcionApi { public CodigoCancelacionIncorrectoExcepcion(){super("DATOS_CANCELACION_INVALIDOS","No ha sido posible validar los datos de cancelación.",HttpStatus.BAD_REQUEST);} }
