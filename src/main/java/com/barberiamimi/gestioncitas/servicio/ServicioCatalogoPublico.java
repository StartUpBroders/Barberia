package com.barberiamimi.gestioncitas.servicio;

import com.barberiamimi.gestioncitas.dto.respuesta.*;
import com.barberiamimi.gestioncitas.entidad.Barberia;
import com.barberiamimi.gestioncitas.excepcion.RecursoNoEncontradoExcepcion;
import com.barberiamimi.gestioncitas.mapper.MapperRespuestas;
import com.barberiamimi.gestioncitas.repositorio.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ServicioCatalogoPublico {
    private final RepositorioBarberia barberias; private final RepositorioServicio servicios; private final RepositorioProfesional profesionales; private final MapperRespuestas mapper;
    public ServicioCatalogoPublico(RepositorioBarberia b,RepositorioServicio s,RepositorioProfesional p,MapperRespuestas m){barberias=b;servicios=s;profesionales=p;mapper=m;}
    @Transactional(readOnly=true) public Barberia buscarBarberia(String slug){return barberias.findBySlugAndActivaTrue(slug).orElseThrow(()->new RecursoNoEncontradoExcepcion("La barbería solicitada no existe o no está activa."));}
    @Transactional(readOnly=true) public BarberiaRespuesta consultar(String slug){return mapper.barberia(buscarBarberia(slug));}
    @Transactional(readOnly=true) public List<ServicioRespuesta> listarServicios(String slug){Barberia b=buscarBarberia(slug);return servicios.findByBarberiaIdAndActivoTrueOrderByNombre(b.getId()).stream().map(mapper::servicio).toList();}
    @Transactional(readOnly=true) public List<ProfesionalRespuesta> listarProfesionales(String slug){Barberia b=buscarBarberia(slug);return profesionales.findByBarberiaIdAndActivoTrueOrderByNombre(b.getId()).stream().map(mapper::profesional).toList();}
}
