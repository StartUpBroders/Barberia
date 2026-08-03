package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.Barberia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface RepositorioBarberia extends JpaRepository<Barberia, Long> { Optional<Barberia> findBySlugAndActivaTrue(String slug); }
