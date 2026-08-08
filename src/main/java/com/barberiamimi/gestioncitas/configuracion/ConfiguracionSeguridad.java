package com.barberiamimi.gestioncitas.configuracion;

import com.barberiamimi.gestioncitas.dto.respuesta.ErrorRespuesta;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import com.barberiamimi.gestioncitas.seguridad.FiltroUsuarioActivo;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Configuration @EnableMethodSecurity
public class ConfiguracionSeguridad {
    @Bean PasswordEncoder codificadorContrasenas(){return new BCryptPasswordEncoder(12);}
    @Bean AuthenticationManager gestorAutenticacion(AuthenticationConfiguration c)throws Exception{return c.getAuthenticationManager();}
    @Bean CorsConfigurationSource fuenteCors(PropiedadesAplicacion p){CorsConfiguration c=new CorsConfiguration();List<String> origenes=new ArrayList<>(p.getCors().getOrigenesPermitidos());if(!origenes.contains("https://barberia-4a998.web.app"))origenes.add("https://barberia-4a998.web.app");c.setAllowedOrigins(origenes);c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));c.setAllowedHeaders(List.of("Content-Type","X-XSRF-TOKEN","Idempotency-Key","Turnstile-Token"));c.setAllowCredentials(true);UrlBasedCorsConfigurationSource f=new UrlBasedCorsConfigurationSource();f.registerCorsConfiguration("/**",c);return f;}
    @Bean SecurityFilterChain cadena(HttpSecurity http,ObjectMapper json,FiltroUsuarioActivo filtroUsuarioActivo,@Value("${COOKIE_SEGURA:false}") boolean cookieSegura,@Value("${COOKIE_SAME_SITE:Lax}") String cookieSameSite)throws Exception{
        CookieCsrfTokenRepository csrf=CookieCsrfTokenRepository.withHttpOnlyFalse();csrf.setCookieName("XSRF-TOKEN");
        csrf.setCookieCustomizer(cookie->cookie.secure(cookieSegura).sameSite(cookieSameSite));
        http.cors(c->{}).csrf(c->c.csrfTokenRepository(csrf))
          .authorizeHttpRequests(a->a.requestMatchers("/api/barberias/**","/api/autenticacion/iniciar-sesion","/api/autenticacion/csrf","/v3/api-docs/**","/swagger-ui/**","/swagger-ui.html").permitAll().requestMatchers("/api/administracion/**").hasAnyRole("PROPIETARIO","BARBERO").anyRequest().authenticated())
          .sessionManagement(s->s.sessionFixation(f->f.changeSessionId()).maximumSessions(2))
          .exceptionHandling(e->e.authenticationEntryPoint((req,res,ex)->escribirError(res,json,401,"NO_AUTENTICADO","Es necesario iniciar sesión.",req.getRequestURI())).accessDeniedHandler((req,res,ex)->escribirError(res,json,403,"ACCESO_DENEGADO","No tienes permisos para realizar esta operación.",req.getRequestURI())))
          .headers(h->h.contentSecurityPolicy(c->c.policyDirectives("default-src 'self'")));
        http.addFilterBefore(filtroUsuarioActivo,AuthorizationFilter.class);
        return http.build();
    }
    private static void escribirError(HttpServletResponse r,ObjectMapper json,int estado,String codigo,String mensaje,String ruta)throws java.io.IOException{r.setStatus(estado);r.setContentType(MediaType.APPLICATION_JSON_VALUE);json.writeValue(r.getOutputStream(),new ErrorRespuesta(codigo,mensaje,List.of(),LocalDateTime.now(),ruta));}
}
