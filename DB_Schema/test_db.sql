-- MySQL dump 10.13  Distrib 8.0.26, for Linux (x86_64)
--
-- Host: localhost    Database: saheya_v02
-- ------------------------------------------------------
-- Server version	8.0.26-0ubuntu0.20.04.3

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
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `amount` int NOT NULL,
  `active_actual` int unsigned NOT NULL,
  `active_previous` int unsigned NOT NULL,
  `pasive_actual` int NOT NULL,
  `pasive_previous` int NOT NULL,
  `transaction_id` int unsigned NOT NULL,
  `holder` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `capital`
--

LOCK TABLES `capital` WRITE;
/*!40000 ALTER TABLE `capital` DISABLE KEYS */;
INSERT INTO `capital` VALUES (1,0,0,0,0,0,0,0);
/*!40000 ALTER TABLE `capital` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cosigner_rels`
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cosigner_rels`
--

LOCK TABLES `cosigner_rels` WRITE;
/*!40000 ALTER TABLE `cosigner_rels` DISABLE KEYS */;
INSERT INTO `cosigner_rels` VALUES (1,1,3,-10800,0,1,3,'2021-10-27 17:57:23',1),(2,1,4,-10800,0,2,3,'2021-10-27 17:58:52',1),(3,1,5,-7600,0,3,3,'2021-10-27 17:59:23',1),(4,1,1,-10800,0,4,3,NULL,1),(5,1,4,0,0,0,3,'2021-10-27 17:39:43',3),(6,1,0,0,0,0,3,'2021-10-27 18:00:13',4);
/*!40000 ALTER TABLE `cosigner_rels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instalments`
--

DROP TABLE IF EXISTS `instalments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instalments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `loan_id` int unsigned NOT NULL,
  `instalment_number` tinyint NOT NULL,
  `amount` int NOT NULL,
  `future_debt` int NOT NULL,
  `valid_from` date NOT NULL,
  `valid_till` date NOT NULL,
  `interest` int unsigned NOT NULL,
  `penalty` int unsigned NOT NULL,
  `payed_amount` int NOT NULL DEFAULT '0',
  `in_debt` int NOT NULL,
  `payment_date` date DEFAULT NULL,
  `status` varchar(11) NOT NULL DEFAULT '1',
  `transaction_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instalments`
--

LOCK TABLES `instalments` WRITE;
/*!40000 ALTER TABLE `instalments` DISABLE KEYS */;
INSERT INTO `instalments` VALUES (1,1,0,-40000,-40000,'2021-10-28','2021-11-10',0,0,0,0,NULL,'2',NULL),(2,1,1,5000,-35000,'2021-12-01','2021-12-31',300,0,0,-40000,NULL,'1',NULL),(3,1,2,5000,-30000,'2022-01-01','2022-01-31',300,0,0,-35000,NULL,'1',NULL),(4,1,3,5000,-25000,'2022-02-01','2022-02-28',300,0,0,-30000,NULL,'1',NULL),(5,1,4,5000,-20000,'2022-03-01','2022-03-31',300,0,0,-25000,NULL,'1',NULL),(6,1,5,5000,-15000,'2022-04-01','2022-04-30',300,0,0,-20000,NULL,'1',NULL),(7,1,6,5000,-10000,'2022-05-01','2022-05-31',300,0,0,-15000,NULL,'1',NULL),(8,1,7,5000,-5000,'2022-06-01','2022-06-30',300,0,0,-10000,NULL,'1',NULL),(9,1,8,5000,0,'2022-07-01','2022-07-31',300,0,0,-5000,NULL,'1',NULL);
/*!40000 ALTER TABLE `instalments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loans` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `type` tinyint NOT NULL DEFAULT '1',
  `initial_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `initial_month` enum('this','next') DEFAULT 'this',
  `instalments_in_total` tinyint NOT NULL,
  `payed_instalments` tinyint NOT NULL DEFAULT '0',
  `debtor_id` int unsigned NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `amount` int DEFAULT NULL,
  `register_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_update` date DEFAULT NULL,
  `payed` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loans`
--

LOCK TABLES `loans` WRITE;
/*!40000 ALTER TABLE `loans` DISABLE KEYS */;
INSERT INTO `loans` VALUES (1,3,'2021-11-09 16:00:00','next',8,0,1,5,40000,'2021-10-28 05:27:46','2021-10-28',0);
/*!40000 ALTER TABLE `loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passwords`
--

DROP TABLE IF EXISTS `passwords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passwords` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passwords`
--

LOCK TABLES `passwords` WRITE;
/*!40000 ALTER TABLE `passwords` DISABLE KEYS */;
INSERT INTO `passwords` VALUES (1,1,'$argon2i$v=19$m=4096,t=3,p=1$FVXaHYvhi2OYudI7YqM41A$ww4lEm90eW6Z9nmAFKLvzfwY0b8CbRK2Xx6euAQYADM'),(2,3,'$argon2i$v=19$m=4096,t=3,p=1$kxfgFyKMTckGSNym74I+/g$0Z7ka8azI5qOpzd9rqVVDPh0I6oHV62wvzzeldb8Pxw'),(3,4,'$argon2i$v=19$m=4096,t=3,p=1$oIdvIqMTeZZUX8Ogy9k+4w$Xht6YbG2U6Qj3YIyfXW6eCb9pHqZ0nxQpq4GhT72a4k'),(4,5,'$argon2i$v=19$m=4096,t=3,p=1$1hR8VgC4rwN24RKCRapnaw$TIKum84CBf+lqQ22nLIfG4jCqfKBnokkHufpOB++VVQ'),(5,6,'$argon2i$v=19$m=4096,t=3,p=1$gxw0F55YxsaH305kAccNRQ$BgppX0lgByTXQ3Q9rYOAA8YvmSvarzzL8WdmU7p9Vok');
/*!40000 ALTER TABLE `passwords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trans_instalments`
--

DROP TABLE IF EXISTS `trans_instalments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trans_instalments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `transaction_id` int NOT NULL,
  `loan_id` int unsigned NOT NULL,
  `instalment_number` tinyint NOT NULL DEFAULT '0',
  `total_amount` int NOT NULL,
  `instalment` int unsigned NOT NULL,
  `interest` int unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trans_instalments`
--

LOCK TABLES `trans_instalments` WRITE;
/*!40000 ALTER TABLE `trans_instalments` DISABLE KEYS */;
/*!40000 ALTER TABLE `trans_instalments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trans_subscriptions`
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
-- Dumping data for table `trans_subscriptions`
--

LOCK TABLES `trans_subscriptions` WRITE;
/*!40000 ALTER TABLE `trans_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `trans_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
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
  UNIQUE KEY `id_document_number` (`id_document_number`),
  UNIQUE KEY `ppal_phone` (`ppal_phone`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Henry','Corredor','1985-03-20',12345,'2020-03-20',NULL,NULL,'2-super-user',12000,0,1),(3,'Henry','Baudilio','1985-03-20',1234,'2020-03-20',NULL,NULL,'1-normal',12000,0,1),(4,'Myriam','Salamanca','1985-03-20',2345,'2020-03-20',NULL,NULL,'3-treasurer',12000,0,1),(5,'Adriana','Corredor','1985-03-20',23456,'2020-03-20',NULL,NULL,'4-president',12000,0,1),(6,'Jairo','Corredor','1985-03-20',234567,'2020-03-20',NULL,NULL,'5-fiscal',12000,0,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-10-28 14:10:49
