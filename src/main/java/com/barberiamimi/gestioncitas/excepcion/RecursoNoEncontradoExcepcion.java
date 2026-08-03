package com.barberiamimi.gestioncitas.excepcion;
import org.springframework.http.HttpStatus;
public class RecursoNoEncontradoExcepcion extends ExcepcionApi { public RecursoNoEncontradoExcepcion(String mensaje){super("RECURSO_NO_ENCONTRADO",mensaje,HttpStatus.NOT_FOUND);} }
