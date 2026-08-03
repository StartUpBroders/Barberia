package com.barberiamimi.gestioncitas.servicio;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named="EJECUTAR_PRUEBAS_INTEGRACION",matches="true")
class ConcurrenciaPostgresqlIntegracionPrueba {
 @Autowired JdbcTemplate jdbc;
 @Test @DisplayName("Dos reservas simultáneas deben dejar una sola cita activa") void debeImpedirReservaConcurrente()throws Exception{
  String sufijo=UUID.randomUUID().toString().substring(0,8);Long barberia=jdbc.queryForObject("INSERT INTO barberias(nombre,slug) VALUES (?,?) RETURNING id",Long.class,"Prueba "+sufijo,"prueba-"+sufijo);Long profesional=jdbc.queryForObject("INSERT INTO profesionales(barberia_id,nombre,alias) VALUES (?,?,?) RETURNING id",Long.class,barberia,"Profesional",sufijo);Long servicio=jdbc.queryForObject("INSERT INTO servicios(barberia_id,nombre,precio,duracion_minutos) VALUES (?,?,?,?) RETURNING id",Long.class,barberia,"Corte",15,30);LocalDateTime inicio=LocalDateTime.of(2035,1,2,10,0),fin=inicio.plusMinutes(30);
  ExecutorService ejecutor=Executors.newFixedThreadPool(2);CountDownLatch salida=new CountDownLatch(1);Callable<Boolean> tarea=()->{salida.await();try{jdbc.update("INSERT INTO citas(barberia_id,profesional_id,servicio_id,nombre_cliente,telefono_cliente,fecha_inicio,fecha_fin,estado,nombre_servicio_reservado,precio_servicio_reservado,duracion_servicio_minutos_reservada,clave_idempotencia,huella_solicitud) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",barberia,profesional,servicio,"Cliente","600000000",Timestamp.valueOf(inicio),Timestamp.valueOf(fin),"CONFIRMADA","Corte",15,30,UUID.randomUUID().toString(),UUID.randomUUID().toString().replace("-","")+UUID.randomUUID().toString().replace("-","").substring(0,32));return true;}catch(DataIntegrityViolationException e){return false;}};Future<Boolean> a=ejecutor.submit(tarea),b=ejecutor.submit(tarea);salida.countDown();int exitos=(a.get()?1:0)+(b.get()?1:0);ejecutor.shutdown();assertEquals(1,exitos);assertEquals(1,jdbc.queryForObject("SELECT count(*) FROM citas WHERE barberia_id=? AND estado='CONFIRMADA'",Integer.class,barberia));jdbc.update("DELETE FROM citas WHERE barberia_id=?",barberia);jdbc.update("DELETE FROM servicios WHERE barberia_id=?",barberia);jdbc.update("DELETE FROM profesionales WHERE barberia_id=?",barberia);jdbc.update("DELETE FROM barberias WHERE id=?",barberia);
 }
}
