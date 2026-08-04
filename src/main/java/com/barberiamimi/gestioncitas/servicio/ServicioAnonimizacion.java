package com.barberiamimi.gestioncitas.servicio;

import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import com.barberiamimi.gestioncitas.entidad.Cita;
import com.barberiamimi.gestioncitas.repositorio.RepositorioCita;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class ServicioAnonimizacion {
    private final RepositorioCita citas; private final PropiedadesAplicacion propiedades;
    public ServicioAnonimizacion(RepositorioCita c,PropiedadesAplicacion p){citas=c;propiedades=p;}
    @Transactional public int anonimizarAntiguas(){int total=0;for(Cita c:citas.buscarParaAnonimizar(LocalDateTime.now().minusMonths(propiedades.getPrivacidad().getMesesConservacionDatosClientes()))){anonimizar(c);total++;}return total;}
    public void anonimizar(Cita c){c.setNombreCliente("ANONIMIZADO");c.setTelefonoCliente("ANONIMIZADO");c.setNotaCliente(null);c.setCodigoCancelacionHmac(null);c.setAnonimizada(true);}
}
