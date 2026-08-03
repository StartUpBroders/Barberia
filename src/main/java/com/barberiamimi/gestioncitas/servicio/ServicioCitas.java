package com.barberiamimi.gestioncitas.servicio;

import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import com.barberiamimi.gestioncitas.dto.solicitud.SolicitudCrearCita;
import com.barberiamimi.gestioncitas.dto.respuesta.CitaCreadaRespuesta;
import com.barberiamimi.gestioncitas.entidad.*;
import com.barberiamimi.gestioncitas.excepcion.*;
import com.barberiamimi.gestioncitas.repositorio.*;
import com.barberiamimi.gestioncitas.utilidad.UtilidadCriptografica;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class ServicioCitas {
    private final ServicioCatalogoPublico catalogo; private final RepositorioServicio servicios; private final RepositorioProfesional profesionales;
    private final RepositorioCita citas; private final ServicioDisponibilidad disponibilidad; private final UtilidadCriptografica criptografia; private final PropiedadesAplicacion propiedades;
    public ServicioCitas(ServicioCatalogoPublico ca,RepositorioServicio s,RepositorioProfesional p,RepositorioCita c,ServicioDisponibilidad d,UtilidadCriptografica u,PropiedadesAplicacion pr){catalogo=ca;servicios=s;profesionales=p;citas=c;disponibilidad=d;criptografia=u;propiedades=pr;}
    @Transactional
    public CitaCreadaRespuesta crear(String slug,String claveIdempotencia,SolicitudCrearCita solicitud){
        if(claveIdempotencia==null||claveIdempotencia.isBlank()||claveIdempotencia.length()>100)throw new SolicitudInvalidaExcepcion("La cabecera Idempotency-Key es obligatoria y debe tener entre 1 y 100 caracteres.");
        Barberia b=catalogo.buscarBarberia(slug); String clave=claveIdempotencia.trim(); String huella=crearHuella(solicitud);
        var anterior=citas.findByBarberiaIdAndClaveIdempotencia(b.getId(),clave);
        if(anterior.isPresent()){if(!anterior.get().getHuellaSolicitud().equals(huella))throw new RecursoDuplicadoExcepcion("La clave de idempotencia ya se utilizó con datos diferentes.");return respuesta(anterior.get(),null,true);}
        Servicio s=servicios.findByIdAndBarberiaIdAndActivoTrue(solicitud.servicioId(),b.getId()).orElseThrow(()->new RecursoNoEncontradoExcepcion("El servicio no existe o no está activo."));
        Profesional p=profesionales.findByIdAndBarberiaIdAndActivoTrue(solicitud.profesionalId(),b.getId()).orElseThrow(()->new RecursoNoEncontradoExcepcion("El profesional no existe o no está activo."));
        LocalDateTime fin=solicitud.fechaInicio().plusMinutes(s.getDuracionMinutos()); disponibilidad.validarDisponible(b.getId(),p.getId(),solicitud.fechaInicio(),fin);
        String codigo=criptografia.generarCodigoCancelacion(); Cita cita=new Cita(b,p,s,limpiar(solicitud.nombreCliente()),limpiar(solicitud.telefonoCliente()),limpiarNullable(solicitud.correoCliente()),solicitud.fechaInicio(),fin,limpiarNullable(solicitud.notaCliente()),null,clave,huella);
        try{citas.saveAndFlush(cita);}catch(DataIntegrityViolationException e){throw new CitaNoDisponibleExcepcion("El horario seleccionado acaba de ser reservado por otro cliente.");}
        cita.setCodigoCancelacionHmac(criptografia.hmac(codigo+":"+cita.getId(),propiedades.getCancelacion().getSecretoHmac())); citas.save(cita);
        return respuesta(cita,codigo,false);
    }
    private String crearHuella(SolicitudCrearCita s){return criptografia.sha256(String.join("|",limpiar(s.nombreCliente()),limpiar(s.telefonoCliente()),String.valueOf(s.correoCliente()),s.servicioId().toString(),s.profesionalId().toString(),s.fechaInicio().toString(),String.valueOf(s.notaCliente())));}
    private CitaCreadaRespuesta respuesta(Cita c,String codigo,boolean repetida){return new CitaCreadaRespuesta(c.getId(),c.getBarberia().getNombre(),c.getProfesional().getNombre(),c.getNombreServicioReservado(),c.getPrecioServicioReservado(),c.getDuracionServicioMinutosReservada(),c.getFechaInicio(),c.getFechaFin(),c.getEstado(),codigo,repetida?"La petición ya se había procesado; se devuelve la cita existente.":"La cita se ha creado correctamente. Guarda el código de cancelación.",repetida);}
    private String limpiar(String v){return v.trim();} private String limpiarNullable(String v){return v==null||v.isBlank()?null:v.trim();}
}
