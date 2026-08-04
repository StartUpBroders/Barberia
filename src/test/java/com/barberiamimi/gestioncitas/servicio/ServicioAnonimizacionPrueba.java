package com.barberiamimi.gestioncitas.servicio;
import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import com.barberiamimi.gestioncitas.entidad.Cita;
import com.barberiamimi.gestioncitas.repositorio.RepositorioCita;
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.List;

class ServicioAnonimizacionPrueba {
 @Test @DisplayName("Debe anonimizar datos personales y conservar el estado estadístico") void debeAnonimizarDatosPersonales(){Cita cita=mock(Cita.class);ServicioAnonimizacion servicio=new ServicioAnonimizacion(mock(RepositorioCita.class),new PropiedadesAplicacion());servicio.anonimizar(cita);verify(cita).setNombreCliente("ANONIMIZADO");verify(cita).setTelefonoCliente("ANONIMIZADO");verify(cita).setNotaCliente(null);verify(cita).setCodigoCancelacionHmac(null);verify(cita).setAnonimizada(true);verify(cita,never()).setEstado(any());}
 @Test @DisplayName("Debe anonimizar todas las citas que superan la conservación") void debeAnonimizarAntiguas(){RepositorioCita repositorio=mock(RepositorioCita.class);Cita primera=mock(Cita.class),segunda=mock(Cita.class);when(repositorio.buscarParaAnonimizar(any())).thenReturn(List.of(primera,segunda));assertEquals(2,new ServicioAnonimizacion(repositorio,new PropiedadesAplicacion()).anonimizarAntiguas());verify(primera).setAnonimizada(true);verify(segunda).setAnonimizada(true);}
}
