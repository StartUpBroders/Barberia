package com.barberiamimi.gestioncitas.excepcion;

import com.barberiamimi.gestioncitas.dto.respuesta.ErrorRespuesta;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.security.core.AuthenticationException;
import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class ManejadorGlobalExcepciones {
    @ExceptionHandler(ExcepcionApi.class)
    ResponseEntity<ErrorRespuesta> manejarApi(ExcepcionApi e, HttpServletRequest p){return responder(e.getEstado(),e.getCodigo(),e.getMessage(),List.of(),p);}
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorRespuesta> manejarValidacion(MethodArgumentNotValidException e,HttpServletRequest p){
        List<String> detalles=e.getBindingResult().getFieldErrors().stream().map(x->x.getField()+": "+x.getDefaultMessage()).toList();
        return responder(HttpStatus.BAD_REQUEST,"DATOS_INVALIDOS","La solicitud contiene datos inválidos.",detalles,p);
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ErrorRespuesta> manejarIntegridad(DataIntegrityViolationException e,HttpServletRequest p){
        return responder(HttpStatus.CONFLICT,"CONFLICTO_DE_DATOS","La operación entra en conflicto con datos existentes.",List.of(),p);
    }
    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ErrorRespuesta> manejarAutenticacion(AuthenticationException e,HttpServletRequest p){return responder(HttpStatus.UNAUTHORIZED,"CREDENCIALES_INVALIDAS","El usuario o la contraseña no son válidos.",List.of(),p);}
    @ExceptionHandler({MissingRequestHeaderException.class,MissingServletRequestParameterException.class,HttpMessageNotReadableException.class,HandlerMethodValidationException.class,ConstraintViolationException.class})
    ResponseEntity<ErrorRespuesta> manejarSolicitudMalFormada(Exception e,HttpServletRequest p){return responder(HttpStatus.BAD_REQUEST,"DATOS_INVALIDOS","La solicitud contiene datos inválidos o incompletos.",List.of(),p);}
    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorRespuesta> manejarImprevisto(Exception e,HttpServletRequest p){return responder(HttpStatus.INTERNAL_SERVER_ERROR,"ERROR_INTERNO","Se ha producido un error interno.",List.of(),p);}
    private ResponseEntity<ErrorRespuesta> responder(HttpStatus estado,String codigo,String mensaje,List<String> detalles,HttpServletRequest p){return ResponseEntity.status(estado).body(new ErrorRespuesta(codigo,mensaje,detalles,LocalDateTime.now(),p.getRequestURI()));}
}
