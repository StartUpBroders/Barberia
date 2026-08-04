package com.barberiamimi.gestioncitas.utilidad;
public final class EnmascaradorDatos {
    private EnmascaradorDatos() {}
    public static String telefono(String valor){if(valor==null||valor.length()<6)return "***";return valor.substring(0,3)+"***"+valor.substring(valor.length()-3);}
}
