-- MySQL dump 10.13  Distrib 8.0.21, for macos10.15 (x86_64)
--
-- Host: localhost    Database: saheyadev_v01
-- ------------------------------------------------------
-- Server version	8.0.21

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `capital`
--

DROP TABLE IF EXISTS `capital`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `capital` (
  `total_actual` int unsigned NOT NULL,
  `total_anterior` int unsigned NOT NULL,
  `motivo_movimiento` tinyint(1) NOT NULL,
  `transaccion_id` int unsigned NOT NULL,
  `monto` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `capital`
--

LOCK TABLES `capital` WRITE;
/*!40000 ALTER TABLE `capital` DISABLE KEYS */;
/*!40000 ALTER TABLE `capital` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contrasenias`
--

DROP TABLE IF EXISTS `contrasenias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contrasenias` (
  `id` int NOT NULL,
  `contrasenia` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contrasenias`
--

LOCK TABLES `contrasenias` WRITE;
/*!40000 ALTER TABLE `contrasenias` DISABLE KEYS */;
INSERT INTO `contrasenias` VALUES (59,'$2b$05$23cuf1DL8qMf0oA1QOWM3OeEaAfl8OIHIs4GZ1hFr6obiBSkdcSpy'),(60,'$2b$05$ZbYazcnSPZhLZ/tavkgHWuYFhYe6D/pNoCU3OxeCHmLy8KT10gPwC'),(61,'$2b$05$xvAk3EUmXsE6n/AxrBcigObQWF8wlV02I6QJHyj0mRFxYDAgBBrgG'),(62,'$2b$05$KhNZmLtezXBcAz7mppClv.rpYt0IhdBPPtePqiGXyP6X8gVJH.VZm'),(63,'$2b$05$HyHIEDtop9PmBmbe7.Jm8.xmYBJ63TcR2IFyCThsTE.pB1ilRLh6q');
/*!40000 ALTER TABLE `contrasenias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prestamos`
--

DROP TABLE IF EXISTS `prestamos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestamos` (
  `prestamo_id` int unsigned NOT NULL AUTO_INCREMENT,
  `fecha_inicial` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `num_cuotas` tinyint NOT NULL,
  `cuotas_pagadas` tinyint NOT NULL DEFAULT '0',
  `deudor_id` int unsigned NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `monto` int DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pagado` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`prestamo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prestamos`
--

LOCK TABLES `prestamos` WRITE;
/*!40000 ALTER TABLE `prestamos` DISABLE KEYS */;
INSERT INTO `prestamos` VALUES (1,'2020-12-30 16:00:00',4,0,59,2,600000,'2020-12-24 08:47:39',0),(2,'2021-01-06 16:00:00',3,0,59,2,50000,'2021-01-01 08:07:40',0),(3,'2021-06-29 16:00:00',2,0,59,1,50000,'2021-06-26 06:36:13',0);
/*!40000 ALTER TABLE `prestamos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `relaciones_coodeudores`
--

DROP TABLE IF EXISTS `relaciones_coodeudores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `relaciones_coodeudores` (
  `id_relacion` int unsigned NOT NULL AUTO_INCREMENT,
  `id_prestamo` int unsigned NOT NULL,
  `id_codeudor` int unsigned NOT NULL,
  `monto_avalado` int NOT NULL,
  `orden` int NOT NULL DEFAULT '1',
  `aprobado` tinyint NOT NULL DEFAULT '2',
  `fecha_aprobacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_relacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `relaciones_coodeudores`
--

LOCK TABLES `relaciones_coodeudores` WRITE;
/*!40000 ALTER TABLE `relaciones_coodeudores` DISABLE KEYS */;
/*!40000 ALTER TABLE `relaciones_coodeudores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transacciones`
--

DROP TABLE IF EXISTS `transacciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transacciones` (
  `transaccion_id` int unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int unsigned NOT NULL,
  `fecha_realizacion` date NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `monto` int NOT NULL,
  `motivo` tinyint(1) NOT NULL,
  `comentario` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`transaccion_id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transacciones`
--

LOCK TABLES `transacciones` WRITE;
/*!40000 ALTER TABLE `transacciones` DISABLE KEYS */;
INSERT INTO `transacciones` VALUES (1,59,'2020-11-10','2020-11-05 11:26:22',4535,1,'fvdfgdfg'),(2,59,'2020-11-10','2020-11-05 11:26:48',4535,1,'fvdfgdfg'),(3,59,'2020-11-04','2020-11-05 11:32:17',2324,1,'sfsadfsadf'),(4,59,'2020-11-04','2020-11-05 11:33:48',2324,1,'sfsadfsadf'),(5,59,'2020-11-09','2020-11-05 11:42:50',43534,1,'sdfadfasdf'),(6,59,'2020-11-09','2020-11-05 11:43:27',43534,1,'sdfadfasdf'),(7,49,'2020-11-18','2020-11-05 11:57:06',324,1,'sadsad');
/*!40000 ALTER TABLE `transacciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transacciones_abonos`
--

DROP TABLE IF EXISTS `transacciones_abonos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transacciones_abonos` (
  `abono_id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `monto` int NOT NULL,
  `comentario` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`abono_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transacciones_abonos`
--

LOCK TABLES `transacciones_abonos` WRITE;
/*!40000 ALTER TABLE `transacciones_abonos` DISABLE KEYS */;
/*!40000 ALTER TABLE `transacciones_abonos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transacciones_prestamos`
--

DROP TABLE IF EXISTS `transacciones_prestamos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transacciones_prestamos` (
  `id_transaccion` int unsigned NOT NULL AUTO_INCREMENT,
  `monto_total` int unsigned NOT NULL,
  `prestamo_id` int unsigned NOT NULL,
  `fecha_realizacion` date NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cuota_numero` tinyint NOT NULL DEFAULT '0',
  `cuotas_restantes` tinyint NOT NULL,
  `interes` int unsigned NOT NULL,
  `abono` int unsigned NOT NULL,
  `por_pagar` int unsigned NOT NULL,
  PRIMARY KEY (`id_transaccion`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transacciones_prestamos`
--

LOCK TABLES `transacciones_prestamos` WRITE;
/*!40000 ALTER TABLE `transacciones_prestamos` DISABLE KEYS */;
/*!40000 ALTER TABLE `transacciones_prestamos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `usuario_id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombres` varchar(30) NOT NULL,
  `apellidos` varchar(30) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `num_identificacion` bigint unsigned NOT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `telefono_ppal` int DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `rol` tinyint(1) NOT NULL DEFAULT '1',
  `capital` int NOT NULL DEFAULT '0',
  `en_deuda` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`usuario_id`),
  UNIQUE KEY `num_identificacion` (`num_identificacion`),
  UNIQUE KEY `telefono_ppal` (`telefono_ppal`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (59,'Henry','Corredor',NULL,1053769244,NULL,NULL,NULL,5,1000000,700000),(60,'Jairo','Corredor',NULL,123,NULL,NULL,NULL,1,800000,0),(61,'Adriana','Corredor',NULL,456,NULL,NULL,NULL,1,1200000,345000),(62,'Myriam','Salamanca',NULL,789,NULL,NULL,NULL,1,30000000,800000),(63,'Henry Baudilio','Corredor',NULL,1123,NULL,NULL,NULL,1,2300000,1800000);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-06-28 10:03:22
