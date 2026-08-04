package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.Barberia;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface RepositorioBarberia extends JpaRepository<Barberia, Long> {
    Optional<Barberia> findBySlugAndActivaTrue(String slug);
    List<Barberia> findByActivaTrueOrderByNombre();
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Barberia b where b.slug=:slug and b.activa=true")
    Optional<Barberia> bloquearPorSlug(@Param("slug") String slug);
}
