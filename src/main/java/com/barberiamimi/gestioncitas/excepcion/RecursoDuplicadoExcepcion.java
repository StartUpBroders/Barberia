package com.barberiamimi.gestioncitas.excepcion;
import org.springframework.http.HttpStatus;
public class RecursoDuplicadoExcepcion extends ExcepcionApi { public RecursoDuplicadoExcepcion(String mensaje){super("RECURSO_DUPLICADO",mensaje,HttpStatus.CONFLICT);} }
