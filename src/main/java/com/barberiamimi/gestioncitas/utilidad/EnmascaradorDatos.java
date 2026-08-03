package com.barberiamimi.gestioncitas.utilidad;
public final class EnmascaradorDatos {
    private EnmascaradorDatos() {}
    public static String telefono(String valor){if(valor==null||valor.length()<6)return "***";return valor.substring(0,3)+"***"+valor.substring(valor.length()-3);}
    public static String correo(String valor){if(valor==null||!valor.contains("@"))return "***";String[] partes=valor.split("@",2);String local=partes[0];return local.substring(0,1)+"***"+(local.length()>1?local.substring(local.length()-1):"")+"@"+partes[1];}
}
