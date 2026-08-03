package com.barberiamimi.gestioncitas.utilidad;

import org.springframework.stereotype.Component;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.HexFormat;

@Component
public class UtilidadCriptografica {
    private final SecureRandom generador = new SecureRandom();
    public String generarCodigoCancelacion(){return String.format("%05d",generador.nextInt(100_000));}
    public String hmac(String texto,String secreto){
        try { Mac mac=Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(secreto.getBytes(StandardCharsets.UTF_8),"HmacSHA256")); return HexFormat.of().formatHex(mac.doFinal(texto.getBytes(StandardCharsets.UTF_8))); }
        catch(GeneralSecurityException e){throw new IllegalStateException("No se pudo inicializar la protección criptográfica.",e);}
    }
    public String sha256(String texto){
        try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(texto.getBytes(StandardCharsets.UTF_8)));}
        catch(NoSuchAlgorithmException e){throw new IllegalStateException("No se pudo calcular la huella.",e);}
    }
    public boolean igualesEnTiempoConstante(String a,String b){return a!=null&&b!=null&&MessageDigest.isEqual(a.getBytes(StandardCharsets.US_ASCII),b.getBytes(StandardCharsets.US_ASCII));}
}
