package com.barberiamimi.gestioncitas.excepcion;
import org.springframework.http.HttpStatus;
public class ExcepcionApi extends RuntimeException {
    private final String codigo; private final HttpStatus estado;
    public ExcepcionApi(String codigo, String mensaje, HttpStatus estado){super(mensaje);this.codigo=codigo;this.estado=estado;}
    public String getCodigo(){return codigo;} public HttpStatus getEstado(){return estado;}
}
