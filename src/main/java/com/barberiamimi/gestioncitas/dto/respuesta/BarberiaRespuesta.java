package com.barberiamimi.gestioncitas.dto.respuesta;
public record BarberiaRespuesta(Long id,String nombre,String slug,String telefono,String instagram,String direccion,String urlGoogleMaps,boolean mostrarUbicacion,boolean activa,int intervaloMinutos,int diasAntelacionReserva) {}
