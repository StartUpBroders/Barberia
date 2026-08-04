package com.barberiamimi.gestioncitas.servicio;

import com.barberiamimi.gestioncitas.repositorio.RepositorioCita;
import java.time.LocalDateTime;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServicioFinalizacionCitas {
    private final RepositorioCita citas;

    public ServicioFinalizacionCitas(RepositorioCita citas) {
        this.citas = citas;
    }

    @Scheduled(fixedDelayString = "${app.citas.intervalo-finalizacion-ms:60000}")
    @Transactional
    public int completarCitasFinalizadas() {
        return citas.completarConfirmadasFinalizadas(LocalDateTime.now());
    }
}
