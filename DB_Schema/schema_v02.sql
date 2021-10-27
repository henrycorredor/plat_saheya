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

DROP DATABASE IF EXISTS saheya_v02;

CREATE DATABASE saheya_v02;

USE saheya_v02;

DROP TABLE IF EXISTS `capital`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `capital` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `amount` int NOT NULL,
  `active_actual` int unsigned NOT NULL,
  `active_previous` int unsigned NOT NULL,
  `pasive_actual` int NOT NULL,
  `pasive_previous` int NOT NULL,
  `transaction_id` int unsigned NOT NULL,
  `holder` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO capital SET amount = 0, active_actual = 0, active_previous = 0, pasive_actual = 0, pasive_previous = 0, transaction_id = 0, holder = 0;

--
-- Table structure for table `contrasenias`
--

DROP TABLE IF EXISTS `passwords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passwords` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prestamos`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loans` (
  `id`  int unsigned NOT NULL AUTO_INCREMENT,
  `type` tinyint NOT NULL DEFAULT '1',
  `initial_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `initial_month` enum('this', 'next') DEFAULT 'this',
  `instalments_in_total` tinyint NOT NULL,
  `payed_instalments` tinyint NOT NULL DEFAULT '0',
  `debtor_id` int unsigned NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `amount` int DEFAULT NULL,
  `register_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_update` DATE NULL DEFAULT NULL,
  `payed` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `relaciones_coodeudores`
--

DROP TABLE IF EXISTS `cosigner_rels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cosigner_rels` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `loan_id` int unsigned NOT NULL,
  `cosigner_id` int unsigned NOT NULL,
  `guaranteed_amount` int NOT NULL,
  `guaranteed_payed` int NOT NULL DEFAULT '0',
  `index` int NOT NULL DEFAULT '1',
  `status` tinyint NOT NULL DEFAULT '1',
  `last_update` timestamp NULL DEFAULT NULL,
  `rol` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transacciones`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `transaction_date` date NOT NULL,
  `registration_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `amount` int NOT NULL,
  `issuer` int NOT NULL,
  `issuer_rol` varchar(15) NOT NULL DEFAULT '1-normal',
  `receiver` int NOT NULL,
  `status` varchar(12) NOT NULL DEFAULT '1-waiting',
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transacciones_abonos`
--

DROP TABLE IF EXISTS `trans_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trans_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_id` int NOT NULL,
  `amount` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transacciones_prestamos`
--

DROP TABLE IF EXISTS `trans_instalments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trans_instalments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `transaction_id` int not null,
  `loan_id` int unsigned NOT NULL,
  `instalment_number` tinyint NOT NULL DEFAULT '0',
  `total_amount` int NOT NULL,
  `instalment` int unsigned NOT NULL,
  `interest` int unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `names` varchar(30) NOT NULL,
  `lastnames` varchar(30) NOT NULL,
  `birthdate` date DEFAULT NULL,
  `id_document_number` bigint unsigned NOT NULL,
  `join_date` date DEFAULT NULL,
  `ppal_phone` bigint DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `rol` varchar(15) NOT NULL DEFAULT '1-normal',
  `capital` int NOT NULL DEFAULT '0',
  `pasive` int NOT NULL DEFAULT '0',
  `capital_frozen` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY (`id_document_number`),
  UNIQUE KEY (`ppal_phone`)
) ENGINE=InnoDB CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

DROP TABLE IF EXISTS `instalments`;
CREATE TABLE `instalments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `loan_id`  int unsigned NOT NULL,
  `instalment_number` tinyint NOT NULL,
  `amount` int NOT NULL,
  `future_debt` int NOT NULL,
  `valid_from` date NOT NULL,
  `valid_till` date NOT NULL,
  `interest` int unsigned NOT NULL,
  `penalty` int unsigned NOT NULL,
  `payed_amount` int NOT NULL DEFAULT '0',
  `in_debt` int NOT NULL,
  `payment_date` date NULL DEFAULT NULL,
  `status` varchar(11) NOT NULL DEFAULT '1',
  `transaction_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB CHARSET=utf8;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-08-18 11:32:47
