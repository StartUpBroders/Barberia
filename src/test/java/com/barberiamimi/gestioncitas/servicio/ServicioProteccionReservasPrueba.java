package com.barberiamimi.gestioncitas.servicio;

import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import com.barberiamimi.gestioncitas.entidad.*;
import com.barberiamimi.gestioncitas.excepcion.LimiteIntentosSuperadoExcepcion;
import com.barberiamimi.gestioncitas.repositorio.*;
import com.barberiamimi.gestioncitas.utilidad.UtilidadCriptografica;
import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.*;
import org.mockito.InOrder;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ServicioProteccionReservasPrueba {
    private final ServicioTurnstile turnstile = mock(ServicioTurnstile.class);
    private final RepositorioBarberia barberias = mock(RepositorioBarberia.class);
    private final RepositorioIntentoReserva intentos = mock(RepositorioIntentoReserva.class);
    private final ServicioLimiteIntentosReserva registro = mock(ServicioLimiteIntentosReserva.class);
    private ServicioLimiteIntentosReserva limite;
    private ServicioProteccionReservas proteccion;
    private Barberia barberia;

    @BeforeEach
    void preparar() throws Exception {
        reset(turnstile, barberias, intentos, registro);
        barberia = new Barberia("Barbería Mimi", "barberia-mimi");
        Field id = Barberia.class.getDeclaredField("id");
        id.setAccessible(true);
        id.set(barberia, 1L);
        when(barberias.bloquearPorSlug("barberia-mimi")).thenReturn(Optional.of(barberia));
        PropiedadesAplicacion propiedades = new PropiedadesAplicacion();
        limite = new ServicioLimiteIntentosReserva(barberias, intentos, new UtilidadCriptografica(), propiedades);
        proteccion = new ServicioProteccionReservas(turnstile, registro);
    }

    @Test
    @DisplayName("Debe admitir los tres primeros intentos de una IP")
    void debeAdmitirTercerIntento() {
        when(intentos.countByBarberiaIdAndHuellaOrigenAndFechaIntentoAfter(eq(1L), anyString(), any(LocalDateTime.class))).thenReturn(2L);
        limite.registrar("barberia-mimi", "198.51.100.20");
        verify(intentos).save(any(IntentoReserva.class));
    }

    @Test
    @DisplayName("Debe rechazar el cuarto intento de una IP en cinco minutos")
    void debeRechazarCuartoIntento() {
        when(intentos.countByBarberiaIdAndHuellaOrigenAndFechaIntentoAfter(eq(1L), anyString(), any(LocalDateTime.class))).thenReturn(3L);
        assertThrows(LimiteIntentosSuperadoExcepcion.class, () -> limite.registrar("barberia-mimi", "198.51.100.20"));
        verify(intentos, never()).save(any());
    }

    @Test
    @DisplayName("Debe registrar el intento antes de consultar Turnstile")
    void debeContarTambienUnaVerificacionFallida() {
        doThrow(new RuntimeException("token rechazado")).when(turnstile).validar(anyString(), anyString());
        assertThrows(RuntimeException.class, () -> proteccion.validarIntento("barberia-mimi", "token", "198.51.100.20"));
        InOrder orden = inOrder(registro, turnstile);
        orden.verify(registro).registrar("barberia-mimi", "198.51.100.20");
        orden.verify(turnstile).validar("token", "198.51.100.20");
    }
}
