package com.barberiamimi.gestioncitas.repositorio;
import com.barberiamimi.gestioncitas.entidad.UsuarioAdministracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
public interface RepositorioUsuarioAdministracion extends JpaRepository<UsuarioAdministracion, Long> {
    Optional<UsuarioAdministracion> findByNombreUsuario(String nombreUsuario);
    Optional<UsuarioAdministracion> findByIdAndBarberiaId(Long id,Long barberiaId);
    Optional<UsuarioAdministracion> findByProfesionalId(Long profesionalId);
    @Query("select (count(u)>0) from UsuarioAdministracion u left join u.profesional p where u.id=:id and u.barberia.id=:barberiaId and u.activo=true and (p is null or p.activo=true)")
    boolean estaActivo(@Param("id") Long id,@Param("barberiaId") Long barberiaId);
}
