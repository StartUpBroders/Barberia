package com.barberiamimi.gestioncitas.servicio;
import com.barberiamimi.gestioncitas.utilidad.UtilidadCriptografica;
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class UtilidadCriptograficaPrueba {
 private final UtilidadCriptografica utilidad=new UtilidadCriptografica();
 @Test @DisplayName("Debe generar códigos de cancelación de cinco cifras") void debeGenerarCodigosDeCincoCifras(){for(int i=0;i<100;i++)assertTrue(utilidad.generarCodigoCancelacion().matches("[0-9]{5}"));}
 @Test @DisplayName("Debe producir un HMAC estable y sensible al identificador") void debeProducirHmacSeguro(){String a=utilidad.hmac("12345:1","secreto-de-prueba-muy-largo-123456");String b=utilidad.hmac("12345:2","secreto-de-prueba-muy-largo-123456");assertEquals(64,a.length());assertNotEquals(a,b);assertTrue(utilidad.igualesEnTiempoConstante(a,utilidad.hmac("12345:1","secreto-de-prueba-muy-largo-123456")));}
}
