package com.barberiamimi.gestioncitas.servicio;

import com.barberiamimi.gestioncitas.repositorio.RepositorioCita;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ServicioFinalizacionCitasPrueba {
    @Test
    void debeCompletarLasCitasConfirmadasCuandoTerminaSuHora() {
        RepositorioCita citas = mock(RepositorioCita.class);
        when(citas.completarConfirmadasFinalizadas(any(LocalDateTime.class))).thenReturn(2);
        ServicioFinalizacionCitas servicio = new ServicioFinalizacionCitas(citas);

        assertEquals(2, servicio.completarCitasFinalizadas());
        verify(citas).completarConfirmadasFinalizadas(any(LocalDateTime.class));
    }
}
