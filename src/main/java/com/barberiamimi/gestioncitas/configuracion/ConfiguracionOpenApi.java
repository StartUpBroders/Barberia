package com.barberiamimi.gestioncitas.configuracion;
import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.*;
@Configuration
public class ConfiguracionOpenApi {
 @Bean OpenAPI api(){return new OpenAPI().info(new Info().title("API de gestión de citas de barberías").version("1.0.0").description("API REST multi-barbería. Las operaciones administrativas usan sesión y token CSRF."));}
}
