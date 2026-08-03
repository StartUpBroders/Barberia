package com.barberiamimi.gestioncitas.excepcion;
import org.springframework.http.HttpStatus;
public class CitaNoDisponibleExcepcion extends ExcepcionApi { public CitaNoDisponibleExcepcion(String mensaje){super("CITA_NO_DISPONIBLE",mensaje,HttpStatus.CONFLICT);} }
