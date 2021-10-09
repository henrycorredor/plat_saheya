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

DROP DATABASE IF EXISTS saheya_v01;

CREATE DATABASE saheya_v01;

USE saheya_v01;

DROP TABLE IF EXISTS `capital`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `capital` (
  `mov_id` int unsigned NOT NULL AUTO_INCREMENT,
  `monto` int NOT NULL,
  `total_activo_actual` int unsigned NOT NULL,
  `total_activo_anterior` int unsigned NOT NULL,
  `total_pasivo_actual` int unsigned NOT NULL,
  `total_pasivo_anterior` int unsigned NOT NULL,
  `transaccion_id` int unsigned NOT NULL,
  `administrador` int NOT NULL,
  PRIMARY KEY (`mov_id`)
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
  `contrasenia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
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
  `prestamo_id`  int unsigned NOT NULL AUTO_INCREMENT,
  `tipo` tinyint NOT NULL DEFAULT '1',
  `fecha_inicial` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mes_inicial` enum('this', 'next') DEFAULT 'this',
  `num_cuotas` tinyint NOT NULL,
  `cuotas_pagadas` tinyint NOT NULL DEFAULT '0',
  `deudor_id` int unsigned NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `monto` int DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ultima_actualizacion` DATE NULL DEFAULT NULL,
  `pagado` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`prestamo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
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
  `rol` tinyint NOT NULL DEFAULT '1',
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
  `fecha_realizacion` date NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `monto` int NOT NULL,
  `emisor` int NOT NULL,
  `rol_emisor` tinyint NOT NULL DEFAULT '1',
  `destinatario` int NOT NULL,
  `estado` tinyint NOT NULL DEFAULT '1',
  `comentario` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`transaccion_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transacciones_abonos`
--

DROP TABLE IF EXISTS `transacciones_abonos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transacciones_abonos` (
  `abono_id` int NOT NULL AUTO_INCREMENT,
  `transaccion_id` int NOT NULL,
  `monto` int NOT NULL,
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
  `pago_id` int not null,
  `prestamo_id` int unsigned NOT NULL,
  `cuota_numero` tinyint NOT NULL DEFAULT '0',
  `monto_total` int unsigned NOT NULL,
  `abono` int unsigned NOT NULL,
  `interes` int unsigned NOT NULL,
  PRIMARY KEY (`id_transaccion`)
) ENGINE=MyISAM CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `capital_congelado` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`usuario_id`),
  UNIQUE KEY (`num_identificacion`),
  UNIQUE KEY (`telefono_ppal`)
) ENGINE=InnoDB CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

DROP TABLE IF EXISTS `cuotas`;
CREATE TABLE `cuotas` (
  `cuota_id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_prestamo`  int unsigned NOT NULL,
  `cuota_num` tinyint NOT NULL,
  `monto` int NOT NULL,
  `en_deuda_futura` int unsigned NOT NULL,
  `vigencia_desde` date NOT NULL,
  `vigencia_hasta` date NOT NULL,
  `interes` int unsigned NOT NULL,
  `multa` int unsigned NOT NULL,
  `pagado` int unsigned NOT NULL DEFAULT '0',
  `en_deuda` int unsigned NOT NULL,
  `fecha_pago` date NULL DEFAULT NULL,
  `estado` tinyint NOT NULL DEFAULT '1',
  `id_transaccion` int DEFAULT NULL,
  PRIMARY KEY (`cuota_id`)
) ENGINE=InnoDB CHARSET=utf8;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-08-18 11:32:47
