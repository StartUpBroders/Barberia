package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.UsuarioAdministracion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface RepositorioUsuarioAdministracion extends JpaRepository<UsuarioAdministracion, Long> {
    Optional<UsuarioAdministracion> findByNombreUsuario(String nombreUsuario);
    Optional<UsuarioAdministracion> findByIdAndBarberiaId(Long id,Long barberiaId);
    Optional<UsuarioAdministracion> findByProfesionalId(Long profesionalId);
}
