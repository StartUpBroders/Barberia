package com.barberiamimi.gestioncitas.servicio;

import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import com.barberiamimi.gestioncitas.entidad.Barberia;
import com.barberiamimi.gestioncitas.entidad.IntentoReserva;
import com.barberiamimi.gestioncitas.excepcion.LimiteIntentosSuperadoExcepcion;
import com.barberiamimi.gestioncitas.excepcion.RecursoNoEncontradoExcepcion;
import com.barberiamimi.gestioncitas.repositorio.RepositorioBarberia;
import com.barberiamimi.gestioncitas.repositorio.RepositorioIntentoReserva;
import com.barberiamimi.gestioncitas.utilidad.UtilidadCriptografica;
import java.time.LocalDateTime;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServicioLimiteIntentosReserva {
    private final RepositorioBarberia barberias;
    private final RepositorioIntentoReserva intentos;
    private final UtilidadCriptografica criptografia;
    private final PropiedadesAplicacion propiedades;

    public ServicioLimiteIntentosReserva(RepositorioBarberia barberias, RepositorioIntentoReserva intentos, UtilidadCriptografica criptografia, PropiedadesAplicacion propiedades) {
        this.barberias = barberias;
        this.intentos = intentos;
        this.criptografia = criptografia;
        this.propiedades = propiedades;
    }

    @Transactional
    public void registrar(String slug, String direccionIp) {
        Barberia barberia = barberias.bloquearPorSlug(slug).orElseThrow(() -> new RecursoNoEncontradoExcepcion("La barbería no existe o no está activa."));
        String huella = criptografia.sha256(barberia.getId() + "|" + direccionIp);
        LocalDateTime desde = LocalDateTime.now().minusMinutes(propiedades.getReservasPublicas().getVentanaMinutos());
        long realizados = intentos.countByBarberiaIdAndHuellaOrigenAndFechaIntentoAfter(barberia.getId(), huella, desde);
        if (realizados >= propiedades.getReservasPublicas().getMaximoIntentos()) throw new LimiteIntentosSuperadoExcepcion();
        intentos.save(new IntentoReserva(barberia, huella));
    }

    @Scheduled(cron = "0 20 3 * * *")
    @Transactional
    public void limpiarIntentosAntiguos() {
        intentos.deleteByFechaIntentoBefore(LocalDateTime.now().minusDays(1));
    }
}
