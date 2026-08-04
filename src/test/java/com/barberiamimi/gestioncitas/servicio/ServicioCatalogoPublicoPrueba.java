package com.barberiamimi.gestioncitas.servicio;
import com.barberiamimi.gestioncitas.entidad.*;
import com.barberiamimi.gestioncitas.excepcion.RecursoNoEncontradoExcepcion;
import com.barberiamimi.gestioncitas.mapper.MapperRespuestas;
import com.barberiamimi.gestioncitas.repositorio.*;
import org.junit.jupiter.api.*;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ServicioCatalogoPublicoPrueba {
 @Test @DisplayName("Debe devolver solo el catálogo activo de la barbería solicitada") void debeDevolverCatalogo()throws Exception{RepositorioBarberia rb=mock(RepositorioBarberia.class);RepositorioServicio rs=mock(RepositorioServicio.class);RepositorioProfesional rp=mock(RepositorioProfesional.class);Barberia b=new Barberia("Mimi","mimi");id(b,1L);Servicio s=new Servicio(b,"Corte",null,new BigDecimal("15"),30);Profesional p=new Profesional(b,"Mimi","mimi");when(rb.findByActivaTrueOrderByNombre()).thenReturn(List.of(b));when(rb.findBySlugAndActivaTrue("mimi")).thenReturn(Optional.of(b));when(rs.findByBarberiaIdAndActivoTrueOrderByNombre(1L)).thenReturn(List.of(s));when(rp.findByBarberiaIdAndActivoTrueOrderByNombre(1L)).thenReturn(List.of(p));ServicioCatalogoPublico servicio=new ServicioCatalogoPublico(rb,rs,rp,new MapperRespuestas());assertEquals("Mimi",servicio.listarBarberias().getFirst().nombre());assertEquals("Mimi",servicio.consultar("mimi").nombre());assertEquals(1,servicio.listarServicios("mimi").size());assertEquals(1,servicio.listarProfesionales("mimi").size());assertThrows(RecursoNoEncontradoExcepcion.class,()->servicio.consultar("inexistente"));}
 private static void id(Object o,Long valor)throws Exception{Field f=o.getClass().getDeclaredField("id");f.setAccessible(true);f.set(o,valor);}
}
