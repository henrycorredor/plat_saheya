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
  `ultima_actualizacion` DATE NULL DEFAULT NULL,
  `pagado` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`prestamo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `aprobado` tinyint NOT NULL DEFAULT '1',
  `fecha_aprobacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_relacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `telefono_ppal` bigint DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `rol` tinyint(1) NOT NULL DEFAULT '1',
  `capital` int NOT NULL DEFAULT '0',
  `en_deuda` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`usuario_id`),
  UNIQUE KEY `num_identificacion` (`num_identificacion`),
  UNIQUE KEY `telefono_ppal` (`telefono_ppal`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-08-18 11:32:47
