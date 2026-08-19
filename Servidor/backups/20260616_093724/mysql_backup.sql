/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: dam2.colexio-karbo.com    Database: proyecto_hfranz
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `categoria` varchar(120) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categoria` (`categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES
(3,'Derechos laborales');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conv_despedida`
--

DROP TABLE IF EXISTS `conv_despedida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `conv_despedida` (
  `juego_id` int(10) unsigned NOT NULL,
  `mensaje` text NOT NULL,
  PRIMARY KEY (`juego_id`),
  CONSTRAINT `conv_despedida_ibfk_1` FOREIGN KEY (`juego_id`) REFERENCES `juegos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conv_despedida`
--

LOCK TABLES `conv_despedida` WRITE;
/*!40000 ALTER TABLE `conv_despedida` DISABLE KEYS */;
INSERT INTO `conv_despedida` VALUES
(9,'Gracias por completar este recorrido sobre derechos laborales.');
/*!40000 ALTER TABLE `conv_despedida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conv_dialogos`
--

DROP TABLE IF EXISTS `conv_dialogos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `conv_dialogos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `juego_id` int(10) unsigned NOT NULL,
  `orden` smallint(5) unsigned NOT NULL DEFAULT 0,
  `prompt` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_juego_orden` (`juego_id`,`orden`),
  CONSTRAINT `conv_dialogos_ibfk_1` FOREIGN KEY (`juego_id`) REFERENCES `juegos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conv_dialogos`
--

LOCK TABLES `conv_dialogos` WRITE;
/*!40000 ALTER TABLE `conv_dialogos` DISABLE KEYS */;
INSERT INTO `conv_dialogos` VALUES
(4,9,0,'Tu jefe te pide quedarte dos horas extra sin avisarte ni pagártelas. ¿Qué haces?'),
(5,9,1,'Al revisar tu contrato, ves que no se menciona el periodo de vacaciones. ¿Qué haces?'),
(6,9,2,'Tu empresa te pide firmar un documento nuevo sin darte tiempo para leerlo. ¿Qué haces?'),
(7,9,3,'Un compañero está siendo tratado injustamente por su superior. ¿Qué haces?'),
(8,9,4,'Te ofrecen un aumento de sueldo a cambio de trabajar más horas, sin reflejarlo por escrito. ¿Qué haces?');
/*!40000 ALTER TABLE `conv_dialogos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conv_opciones`
--

DROP TABLE IF EXISTS `conv_opciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `conv_opciones` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `dialogo_id` int(10) unsigned NOT NULL,
  `letra` enum('A','B') NOT NULL,
  `texto` text NOT NULL,
  `explicacion` text DEFAULT NULL,
  `peso_a` smallint(6) NOT NULL DEFAULT 0,
  `peso_b` smallint(6) NOT NULL DEFAULT 0,
  `peso_c` smallint(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dialogo_letra` (`dialogo_id`,`letra`),
  KEY `idx_dialogo` (`dialogo_id`),
  CONSTRAINT `conv_opciones_ibfk_1` FOREIGN KEY (`dialogo_id`) REFERENCES `conv_dialogos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conv_opciones`
--

LOCK TABLES `conv_opciones` WRITE;
/*!40000 ALTER TABLE `conv_opciones` DISABLE KEYS */;
INSERT INTO `conv_opciones` VALUES
(7,4,'A','Le explico que las horas extra deben pagarse o compensarse según el convenio.','Las horas extraordinarias deben ser compensadas según la normativa o el convenio aplicable.',2,0,0),
(8,4,'B','Me quedo sin decir nada para no causar problemas.','Aceptar sin más puede normalizar el incumplimiento de tus derechos laborales.',0,2,0),
(9,5,'A','Pregunto a Recursos Humanos, ya que las vacaciones pagadas son un derecho aunque no se detallen.','El derecho a vacaciones pagadas existe aunque el contrato no lo especifique.',2,0,0),
(10,5,'B','Asumo que no tengo derecho a vacaciones si no aparece en el contrato.','Las vacaciones pagadas son un derecho mínimo, independientemente de lo que diga el contrato.',0,2,0),
(11,6,'A','Pido tiempo para leerlo con calma antes de firmar.','Tienes derecho a revisar cualquier documento antes de firmarlo.',2,0,0),
(12,6,'B','Lo firmo rápido para no incomodar a mi jefe.','Firmar sin leer puede comprometer derechos importantes sin que lo sepas.',0,2,0),
(13,7,'A','Le informo que puede acudir al sindicato o a Recursos Humanos para presentar una queja.','Existen canales formales, como sindicatos o RRHH, para denunciar tratos injustos.',2,0,0),
(14,7,'B','Le digo que es mejor no meterse en problemas y dejarlo pasar.','Ignorar situaciones injustas puede perpetuar abusos que la ley permite denunciar.',0,2,0),
(15,8,'A','Pido que el nuevo acuerdo, horas y sueldo, quede reflejado por escrito en el contrato.','Cualquier cambio en las condiciones laborales debe quedar documentado formalmente.',2,0,0),
(16,8,'B','Acepto de palabra, confiando en que todo se mantendrá como se dijo.','Los acuerdos verbales son difíciles de probar y pueden dejarte sin protección legal.',0,2,0);
/*!40000 ALTER TABLE `conv_opciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conv_puntuadores`
--

DROP TABLE IF EXISTS `conv_puntuadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `conv_puntuadores` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `juego_id` int(10) unsigned NOT NULL,
  `letra` enum('A','B','C') NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `rango_min` smallint(6) NOT NULL,
  `rango_max` smallint(6) NOT NULL,
  `desenlace` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_juego_letra` (`juego_id`,`letra`),
  KEY `idx_juego` (`juego_id`),
  CONSTRAINT `conv_puntuadores_ibfk_1` FOREIGN KEY (`juego_id`) REFERENCES `juegos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conv_puntuadores`
--

LOCK TABLES `conv_puntuadores` WRITE;
/*!40000 ALTER TABLE `conv_puntuadores` DISABLE KEYS */;
INSERT INTO `conv_puntuadores` VALUES
(3,9,'A','Trabajador Informado',6,10,'Conoces bien tus derechos y sabes cómo defenderlos en el día a día laboral.'),
(4,9,'B','Trabajador Desprotegido',0,5,'Conviene informarte mejor sobre tus derechos para evitar situaciones injustas.');
/*!40000 ALTER TABLE `conv_puntuadores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_validacion`
--

DROP TABLE IF EXISTS `historial_validacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_validacion` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `juego_id` int(10) unsigned NOT NULL,
  `estado_anterior` tinyint(1) NOT NULL,
  `estado_nuevo` tinyint(1) NOT NULL,
  `cambiado_por` varchar(255) NOT NULL,
  `cambiado_el` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_juego` (`juego_id`),
  KEY `idx_fecha` (`cambiado_el`),
  CONSTRAINT `historial_validacion_ibfk_1` FOREIGN KEY (`juego_id`) REFERENCES `juegos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_validacion`
--

LOCK TABLES `historial_validacion` WRITE;
/*!40000 ALTER TABLE `historial_validacion` DISABLE KEYS */;
INSERT INTO `historial_validacion` VALUES
(4,9,0,0,'hefrafol@gmail.com','2026-06-15 12:47:42'),
(5,9,0,0,'hefrafol@gmail.com','2026-06-15 12:48:06'),
(6,8,0,1,'hefrafol@gmail.com','2026-06-15 12:48:51'),
(7,9,0,1,'hefrafol@gmail.com','2026-06-15 12:48:56'),
(8,7,0,1,'hefrafol@gmail.com','2026-06-15 12:49:03'),
(9,6,0,1,'hefrafol@gmail.com','2026-06-15 12:49:08');
/*!40000 ALTER TABLE `historial_validacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `juegos`
--

DROP TABLE IF EXISTS `juegos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `juegos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(30) NOT NULL,
  `tipo_id` smallint(5) unsigned NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `correo_autor` varchar(255) NOT NULL,
  `categoria_id` smallint(5) unsigned DEFAULT NULL,
  `validado` tinyint(1) NOT NULL DEFAULT 0,
  `creado_el` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_el` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_tipo` (`tipo_id`),
  KEY `idx_correo` (`correo_autor`),
  KEY `idx_validado` (`validado`),
  KEY `idx_categoria` (`categoria_id`),
  CONSTRAINT `juegos_ibfk_1` FOREIGN KEY (`tipo_id`) REFERENCES `tipos_juego` (`id`),
  CONSTRAINT `juegos_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `juegos`
--

LOCK TABLES `juegos` WRITE;
/*!40000 ALTER TABLE `juegos` DISABLE KEYS */;
INSERT INTO `juegos` VALUES
(6,'VF-2026-00006',1,'Derechos Laborales: Verdadero o Falso','hefrafol@gmail.com',3,1,'2026-06-15 11:54:20','2026-06-15 12:49:08'),
(7,'RF-2026-00007',3,'Completa la Frase: Derechos Laborales','hefrafol@gmail.com',3,1,'2026-06-15 11:54:40','2026-06-15 12:49:03'),
(8,'UC-2026-00008',2,'Términos y Definiciones de Derechos Laborales','hefrafol@gmail.com',3,1,'2026-06-15 12:35:09','2026-06-15 12:48:51'),
(9,'CONV-2026-00009',4,'Diálogo: ¿Conoces tus Derechos Laborales?','hefrafol@gmail.com',3,1,'2026-06-15 12:47:03','2026-06-15 12:48:56');
/*!40000 ALTER TABLE `juegos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rf_preguntas`
--

DROP TABLE IF EXISTS `rf_preguntas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rf_preguntas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `juego_id` int(10) unsigned NOT NULL,
  `orden` smallint(5) unsigned NOT NULL DEFAULT 0,
  `frase` text NOT NULL,
  `respuesta` varchar(500) NOT NULL,
  `explicacion` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_juego_orden` (`juego_id`,`orden`),
  CONSTRAINT `rf_preguntas_ibfk_1` FOREIGN KEY (`juego_id`) REFERENCES `juegos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rf_preguntas`
--

LOCK TABLES `rf_preguntas` WRITE;
/*!40000 ALTER TABLE `rf_preguntas` DISABLE KEYS */;
INSERT INTO `rf_preguntas` VALUES
(6,7,0,'Todo trabajador tiene derecho a un [___] mínimo establecido por ley.','salario','El salario mínimo garantiza un ingreso básico para los trabajadores.'),
(7,7,1,'El [___] colectivo regula las condiciones de trabajo acordadas entre empresa y sindicatos.','convenio','El convenio colectivo surge de la negociación colectiva.'),
(8,7,2,'La [___] laboral es el tiempo durante el cual el trabajador está a disposición del empleador.','jornada','La jornada laboral suele tener una duración máxima regulada por ley.'),
(9,7,3,'Al finalizar un contrato bajo ciertas condiciones, el trabajador puede recibir una [___] por despido.','indemnización','Su cuantía depende del tipo de despido y la antigüedad.'),
(10,7,4,'La [___] sindical permite a los trabajadores afiliarse libremente a un sindicato.','libertad','Es un derecho fundamental reconocido internacionalmente.');
/*!40000 ALTER TABLE `rf_preguntas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_juego`
--

DROP TABLE IF EXISTS `tipos_juego`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_juego` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_juego`
--

LOCK TABLES `tipos_juego` WRITE;
/*!40000 ALTER TABLE `tipos_juego` DISABLE KEYS */;
INSERT INTO `tipos_juego` VALUES
(4,'Conversacion'),
(3,'Rellenar Frases'),
(2,'Unir Conceptos'),
(1,'Verdadero y Falso');
/*!40000 ALTER TABLE `tipos_juego` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uc_parejas`
--

DROP TABLE IF EXISTS `uc_parejas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `uc_parejas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `juego_id` int(10) unsigned NOT NULL,
  `orden` smallint(5) unsigned NOT NULL DEFAULT 0,
  `termino` varchar(500) NOT NULL,
  `definicion` text NOT NULL,
  `explicacion` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_juego_orden` (`juego_id`,`orden`),
  CONSTRAINT `uc_parejas_ibfk_1` FOREIGN KEY (`juego_id`) REFERENCES `juegos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uc_parejas`
--

LOCK TABLES `uc_parejas` WRITE;
/*!40000 ALTER TABLE `uc_parejas` DISABLE KEYS */;
INSERT INTO `uc_parejas` VALUES
(4,8,0,'Salario mínimo','Cantidad mínima que un empleador debe pagar a un trabajador por su jornada laboral.','Establecido por ley para garantizar un ingreso básico digno.'),
(5,8,1,'Convenio colectivo','Acuerdo entre representantes de trabajadores y empleadores que regula condiciones de trabajo.','Resultado de la negociación colectiva entre sindicatos y empresas.'),
(6,8,2,'Indemnización por despido','Compensación económica que recibe un trabajador al finalizar su contrato bajo ciertas condiciones.','Su cuantía depende del tipo de despido y la antigüedad del trabajador.'),
(7,8,3,'Jornada laboral','Tiempo durante el cual el trabajador está a disposición del empleador para realizar su trabajo.','Su duración máxima suele estar regulada por la legislación laboral.'),
(8,8,4,'Excedencia','Suspensión temporal del contrato de trabajo, sin remuneración, manteniendo el derecho a reincorporación.','Puede solicitarse por motivos personales, familiares o de cuidado.');
/*!40000 ALTER TABLE `uc_parejas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vf_preguntas`
--

DROP TABLE IF EXISTS `vf_preguntas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vf_preguntas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `juego_id` int(10) unsigned NOT NULL,
  `orden` smallint(5) unsigned NOT NULL DEFAULT 0,
  `enunciado` text NOT NULL,
  `respuesta` tinyint(1) NOT NULL,
  `explicacion` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_juego_orden` (`juego_id`,`orden`),
  CONSTRAINT `vf_preguntas_ibfk_1` FOREIGN KEY (`juego_id`) REFERENCES `juegos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vf_preguntas`
--

LOCK TABLES `vf_preguntas` WRITE;
/*!40000 ALTER TABLE `vf_preguntas` DISABLE KEYS */;
INSERT INTO `vf_preguntas` VALUES
(9,6,0,'Todo trabajador tiene derecho a un periodo de vacaciones pagadas cada año.',1,'El descanso anual remunerado es un derecho laboral básico reconocido en la legislación.'),
(10,6,1,'Un empleador puede despedir a un trabajador sin dar ningún motivo ni notificación.',0,'Los despidos deben ajustarse a causas y procedimientos establecidos por la ley.'),
(11,6,2,'Las trabajadoras embarazadas tienen derecho a protección especial frente al despido.',1,'La maternidad está protegida por normas específicas contra el despido discriminatorio.'),
(12,6,3,'Las horas extraordinarias nunca deben pagarse de forma diferente al salario ordinario.',0,'Las horas extra suelen tener un recargo o compensación adicional sobre el salario base.'),
(13,6,4,'El derecho a la libertad sindical permite a los trabajadores afiliarse a un sindicato.',1,'La libertad sindical es un derecho fundamental reconocido internacionalmente.');
/*!40000 ALTER TABLE `vf_preguntas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-16  9:37:24
