package com.barberiamimi.gestioncitas;

import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableConfigurationProperties(PropiedadesAplicacion.class)
@EnableScheduling
public class GestionCitasAplicacion {
    public static void main(String[] argumentos) {
        SpringApplication.run(GestionCitasAplicacion.class, argumentos);
    }
}
