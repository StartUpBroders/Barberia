package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.AuditoriaAdministrativa;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RepositorioAuditoriaAdministrativa extends JpaRepository<AuditoriaAdministrativa, Long> {
    void deleteByUsuarioId(Long usuarioId);
}
