package com.barberiamimi.gestioncitas.entidad;

import com.barberiamimi.gestioncitas.enumeracion.CanceladaPor;
import com.barberiamimi.gestioncitas.enumeracion.EstadoCita;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Duration;

@Entity
@Table(name = "citas", uniqueConstraints = @UniqueConstraint(name = "uq_cita_idempotencia_barberia", columnNames = {"barberia_id", "clave_idempotencia"}))
public class Cita extends EntidadAuditable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "barberia_id", nullable = false) private Barberia barberia;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "profesional_id", nullable = false) private Profesional profesional;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "servicio_id", nullable = false) private Servicio servicio;
    @Column(name="nombre_cliente", nullable=false, length=100) 
    private String nombreCliente;
    
    @Column(name="telefono_cliente", nullable=false, length=20) private String telefonoCliente;
    @Column(name="fecha_inicio", nullable=false) private LocalDateTime fechaInicio;
    @Column(name="fecha_fin", nullable=false) private LocalDateTime fechaFin;
    @Column(name="nota_cliente", length=1000) private String notaCliente;
    @Column(name="codigo_cancelacion_hmac", length=64) private String codigoCancelacionHmac;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=30) private EstadoCita estado;
    @Enumerated(EnumType.STRING) @Column(name="cancelada_por", length=12) private CanceladaPor canceladaPor;
    @Column(name="motivo_cancelacion", length=500) private String motivoCancelacion;
    @Column(name="fecha_cancelacion") private LocalDateTime fechaCancelacion;
    @Column(name="nombre_servicio_reservado", nullable=false, length=120) private String nombreServicioReservado;
    @Column(name="precio_servicio_reservado", nullable=false, precision=10, scale=2) private BigDecimal precioServicioReservado;
    @Column(name="duracion_servicio_minutos_reservada", nullable=false) private int duracionServicioMinutosReservada;
    @Column(name="clave_idempotencia", nullable=false, length=100) private String claveIdempotencia;
    @Column(name="huella_solicitud", nullable=false, length=64) private String huellaSolicitud;
    @Column(nullable=false) private boolean anonimizada;
    protected Cita() {}
    public Cita(Barberia b, Profesional p, Servicio s, String nombre, String telefono,
                LocalDateTime inicio, LocalDateTime fin, String nota, String hmac, String clave, String huella) {
        barberia=b; profesional=p; servicio=s; nombreCliente=nombre; telefonoCliente=telefono;
        fechaInicio=inicio; fechaFin=fin; notaCliente=nota; codigoCancelacionHmac=hmac; claveIdempotencia=clave;
        huellaSolicitud=huella; estado=EstadoCita.CONFIRMADA; nombreServicioReservado=s.getNombre();
        precioServicioReservado=s.getPrecio(); duracionServicioMinutosReservada=(int)Duration.between(inicio,fin).toMinutes();
    }
    public Long getId(){return id;} public Barberia getBarberia(){return barberia;} public Profesional getProfesional(){return profesional;} public Servicio getServicio(){return servicio;}
    public String getNombreCliente(){return nombreCliente;} public void setNombreCliente(String v){nombreCliente=v;}
    public String getTelefonoCliente(){return telefonoCliente;} public void setTelefonoCliente(String v){telefonoCliente=v;}
    public LocalDateTime getFechaInicio(){return fechaInicio;} public void setFechaInicio(LocalDateTime v){fechaInicio=v;}
    public LocalDateTime getFechaFin(){return fechaFin;} public void setFechaFin(LocalDateTime v){fechaFin=v;}
    public String getNotaCliente(){return notaCliente;} public void setNotaCliente(String v){notaCliente=v;}
    public String getCodigoCancelacionHmac(){return codigoCancelacionHmac;} public void setCodigoCancelacionHmac(String v){codigoCancelacionHmac=v;}
    public EstadoCita getEstado(){return estado;} public void setEstado(EstadoCita v){estado=v;}
    public CanceladaPor getCanceladaPor(){return canceladaPor;} public void setCanceladaPor(CanceladaPor v){canceladaPor=v;}
    public String getMotivoCancelacion(){return motivoCancelacion;} public void setMotivoCancelacion(String v){motivoCancelacion=v;}
    public LocalDateTime getFechaCancelacion(){return fechaCancelacion;} public void setFechaCancelacion(LocalDateTime v){fechaCancelacion=v;}
    public String getNombreServicioReservado(){return nombreServicioReservado;} public BigDecimal getPrecioServicioReservado(){return precioServicioReservado;}
    public int getDuracionServicioMinutosReservada(){return duracionServicioMinutosReservada;}
    public String getClaveIdempotencia(){return claveIdempotencia;} public String getHuellaSolicitud(){return huellaSolicitud;}
    public boolean isAnonimizada(){return anonimizada;} public void setAnonimizada(boolean v){anonimizada=v;}
    public boolean estaActiva(){return estado==EstadoCita.RESERVADA || estado==EstadoCita.CONFIRMADA;}
    public void actualizarReserva(Profesional p,Servicio s,String nombre,String telefono,LocalDateTime inicio,LocalDateTime fin,String nota){profesional=p;servicio=s;nombreCliente=nombre;telefonoCliente=telefono;fechaInicio=inicio;fechaFin=fin;notaCliente=nota;nombreServicioReservado=s.getNombre();precioServicioReservado=s.getPrecio();duracionServicioMinutosReservada=(int)Duration.between(inicio,fin).toMinutes();}
}
