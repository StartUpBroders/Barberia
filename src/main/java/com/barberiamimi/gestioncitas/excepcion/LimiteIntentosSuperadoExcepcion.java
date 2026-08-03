package com.barberiamimi.gestioncitas.excepcion;
import org.springframework.http.HttpStatus;
public class LimiteIntentosSuperadoExcepcion extends ExcepcionApi { public LimiteIntentosSuperadoExcepcion(){super("DEMASIADOS_INTENTOS","Se han realizado demasiados intentos. Inténtalo más tarde.",HttpStatus.TOO_MANY_REQUESTS);} }
