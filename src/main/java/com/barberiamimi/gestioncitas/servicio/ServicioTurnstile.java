package com.barberiamimi.gestioncitas.servicio;

import com.barberiamimi.gestioncitas.configuracion.PropiedadesAplicacion;
import com.barberiamimi.gestioncitas.excepcion.VerificacionAntibotExcepcion;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Duration;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class ServicioTurnstile {
    private static final String URL_VERIFICACION = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    private final PropiedadesAplicacion propiedades;
    private final RestClient cliente;

    public ServicioTurnstile(PropiedadesAplicacion propiedades) {
        this.propiedades = propiedades;
        SimpleClientHttpRequestFactory fabrica = new SimpleClientHttpRequestFactory();
        fabrica.setConnectTimeout(Duration.ofSeconds(5));
        fabrica.setReadTimeout(Duration.ofSeconds(8));
        cliente = RestClient.builder().requestFactory(fabrica).build();
    }

    public void validar(String token, String direccionIp) {
        String secreto = propiedades.getReservasPublicas().getTurnstileSecreto();
        if (secreto == null || secreto.isBlank() || token == null || token.isBlank()) {
            throw new VerificacionAntibotExcepcion();
        }
        LinkedMultiValueMap<String, String> cuerpo = new LinkedMultiValueMap<>();
        cuerpo.add("secret", secreto);
        cuerpo.add("response", token);
        if (direccionIp != null && !direccionIp.isBlank()) cuerpo.add("remoteip", direccionIp);
        try {
            RespuestaTurnstile respuesta = cliente.post()
                .uri(URL_VERIFICACION)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(cuerpo)
                .retrieve()
                .body(RespuestaTurnstile.class);
            if (respuesta == null || !respuesta.success()) throw new VerificacionAntibotExcepcion();
        } catch (VerificacionAntibotExcepcion e) {
            throw e;
        } catch (RestClientException e) {
            throw new VerificacionAntibotExcepcion();
        }
    }

    record RespuestaTurnstile(boolean success, @JsonProperty("error-codes") List<String> errores) {}
}
