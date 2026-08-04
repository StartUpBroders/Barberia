package com.barberiamimi.gestioncitas.servicio;

import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import com.barberiamimi.gestioncitas.dto.solicitud.SolicitudCancelarCita;
import com.barberiamimi.gestioncitas.dto.respuesta.MensajeRespuesta;
import com.barberiamimi.gestioncitas.entidad.*;
import com.barberiamimi.gestioncitas.enumeracion.*;
import com.barberiamimi.gestioncitas.excepcion.*;
import com.barberiamimi.gestioncitas.repositorio.*;
import com.barberiamimi.gestioncitas.utilidad.UtilidadCriptografica;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class ServicioCancelacion {
    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("EEEE d 'de' MMMM 'de' yyyy", Locale.forLanguageTag("es-ES"));
    private static final DateTimeFormatter FORMATO_HORA = DateTimeFormatter.ofPattern("HH:mm");
    private final ServicioCatalogoPublico catalogo; private final RepositorioCita citas; private final RepositorioNotificacion notificaciones;
    private final RepositorioIntentoCancelacion intentos; private final UtilidadCriptografica criptografia; private final PropiedadesAplicacion propiedades;
    public ServicioCancelacion(ServicioCatalogoPublico ca,RepositorioCita c,RepositorioNotificacion n,RepositorioIntentoCancelacion i,UtilidadCriptografica u,PropiedadesAplicacion p){catalogo=ca;citas=c;notificaciones=n;intentos=i;criptografia=u;propiedades=p;}
    @Transactional(noRollbackFor = CodigoCancelacionIncorrectoExcepcion.class)
    public MensajeRespuesta cancelar(String slug,SolicitudCancelarCita solicitud,String direccionIp){
        Barberia b=catalogo.buscarBarberia(slug); String telefono=solicitud.telefonoCliente().replaceAll("\\s+","");
        String huella=criptografia.sha256(b.getId()+"|"+direccionIp+"|"+telefono); LocalDateTime desde=LocalDateTime.now().minusMinutes(propiedades.getCancelacion().getVentanaMinutos());
        long fallos=intentos.countByBarberiaIdAndHuellaOrigenAndExitosoFalseAndFechaIntentoAfter(b.getId(),huella,desde);
        boolean bloqueado=fallos>=propiedades.getCancelacion().getMaximoIntentos()&&intentos.findTopByBarberiaIdAndHuellaOrigenAndExitosoFalseOrderByFechaIntentoDesc(b.getId(),huella).map(i->i.getFechaIntento().plusMinutes(propiedades.getCancelacion().getBloqueoMinutos()).isAfter(LocalDateTime.now())).orElse(false);
        if(bloqueado)throw new LimiteIntentosSuperadoExcepcion();
        List<Cita> candidatas=citas.findByBarberiaIdAndTelefonoClienteAndEstadoInAndAnonimizadaFalse(b.getId(),telefono,List.of(EstadoCita.RESERVADA,EstadoCita.CONFIRMADA));
        Cita encontrada=candidatas.stream().filter(c->criptografia.igualesEnTiempoConstante(c.getCodigoCancelacionHmac(),criptografia.hmac(solicitud.codigoCancelacion()+":"+c.getId(),propiedades.getCancelacion().getSecretoHmac()))).findFirst().orElse(null);
        if(encontrada==null){intentos.save(new IntentoCancelacion(b,huella,false));throw new CodigoCancelacionIncorrectoExcepcion();}
        if(encontrada.getFechaInicio().isBefore(LocalDateTime.now().plusHours(propiedades.getCancelacion().getHorasLimite())))throw new CancelacionNoPermitidaExcepcion("La cita ya no puede cancelarse desde la web. Ponte en contacto con la barbería.");
        encontrada.setEstado(EstadoCita.CANCELADA_POR_CLIENTE); encontrada.setCanceladaPor(CanceladaPor.CLIENTE); encontrada.setFechaCancelacion(LocalDateTime.now()); encontrada.setCodigoCancelacionHmac(null); citas.save(encontrada); intentos.save(new IntentoCancelacion(b,huella,true));
        String titulo=encontrada.getNombreCliente()+" canceló su cita";
        String mensaje="La cita del "+encontrada.getFechaInicio().format(FORMATO_FECHA)+", de "+encontrada.getFechaInicio().format(FORMATO_HORA)+" a "+encontrada.getFechaFin().format(FORMATO_HORA)+", con "+encontrada.getProfesional().getNombre()+" para "+encontrada.getNombreServicioReservado()+" ha sido cancelada. Ese horario vuelve a estar disponible.";
        notificaciones.save(new Notificacion(b,encontrada.getProfesional(),encontrada,TipoNotificacion.CITA_CANCELADA,titulo,mensaje));
        return new MensajeRespuesta("CITA_CANCELADA","La cita se ha cancelado correctamente.");
    }
}
