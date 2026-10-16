CREATE DATABASE  IF NOT EXISTS `db-running-power` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db-running-power`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: db-running-power
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `athlete_groups`
--

DROP TABLE IF EXISTS `athlete_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `athlete_groups` (
  `athlete_id` int NOT NULL,
  `training_group_id` int NOT NULL,
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`athlete_id`,`training_group_id`),
  KEY `idx_athlete_groups_group_id` (`training_group_id`),
  CONSTRAINT `fk_athlete_groups_athlete` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_athlete_groups_group` FOREIGN KEY (`training_group_id`) REFERENCES `training_groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `athlete_groups`
--

LOCK TABLES `athlete_groups` WRITE;
/*!40000 ALTER TABLE `athlete_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `athlete_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `athlete_races`
--

DROP TABLE IF EXISTS `athlete_races`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `athlete_races` (
  `athlete_id` int NOT NULL,
  `race_id` int NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'registered',
  `result_time_seconds` int unsigned DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `registered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`athlete_id`,`race_id`),
  KEY `idx_athlete_races_race_id` (`race_id`),
  CONSTRAINT `fk_athlete_races_athlete` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_athlete_races_race` FOREIGN KEY (`race_id`) REFERENCES `races` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_athlete_races_status` CHECK ((`status` in (_utf8mb4'registered',_utf8mb4'completed',_utf8mb4'dns',_utf8mb4'dnf',_utf8mb4'cancelled')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `athlete_races`
--

LOCK TABLES `athlete_races` WRITE;
/*!40000 ALTER TABLE `athlete_races` DISABLE KEYS */;
/*!40000 ALTER TABLE `athlete_races` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `athletes`
--

DROP TABLE IF EXISTS `athletes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `athletes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assessor_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `goal` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `availability` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_athletes_user_id` (`user_id`),
  KEY `idx_athletes_assessor_id` (`assessor_id`),
  CONSTRAINT `fk_athletes_assessor` FOREIGN KEY (`assessor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_athletes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `athletes`
--

LOCK TABLES `athletes` WRITE;
/*!40000 ALTER TABLE `athletes` DISABLE KEYS */;
/*!40000 ALTER TABLE `athletes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faqs_category_id` int NOT NULL,
  `question` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_faqs_category_id` (`faqs_category_id`),
  KEY `idx_faqs_active` (`active`),
  CONSTRAINT `fk_faqs_category` FOREIGN KEY (`faqs_category_id`) REFERENCES `faqs_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
INSERT INTO `faqs` VALUES (1,1,'Posso cancelar quando quiser?','Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas extras. Seu acesso permanece ativo até o final do período já pago.',1),(2,1,'Como faço para me cadastrar como acessor.','Entre com nome, email e senha e boa sorte!',1),(3,1,'Nova Pergunta','Nova Resposta...',1),(4,1,'Como faço para criar uma nova conta','Clique me cadastro.',1),(5,1,'Mais uma pergunta?','Mais uma resposta!',1),(6,1,'sfsdf','ddfg',1);
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs_categories`
--

DROP TABLE IF EXISTS `faqs_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_faqs_categories_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs_categories`
--

LOCK TABLES `faqs_categories` WRITE;
/*!40000 ALTER TABLE `faqs_categories` DISABLE KEYS */;
INSERT INTO `faqs_categories` VALUES (1,'Geral',1),(2,'Corredores',1);
/*!40000 ALTER TABLE `faqs_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `races`
--

DROP TABLE IF EXISTS `races`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `races` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assessor_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `race_date` date NOT NULL,
  `distance_km` decimal(6,2) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_races_assessor_id` (`assessor_id`),
  KEY `idx_races_date` (`race_date`),
  CONSTRAINT `fk_races_assessor` FOREIGN KEY (`assessor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `races`
--

LOCK TABLES `races` WRITE;
/*!40000 ALTER TABLE `races` DISABLE KEYS */;
/*!40000 ALTER TABLE `races` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `training_groups`
--

DROP TABLE IF EXISTS `training_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assessor_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `objective` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_training_groups_assessor_name` (`assessor_id`,`name`),
  KEY `idx_training_groups_assessor_id` (`assessor_id`),
  CONSTRAINT `fk_training_groups_assessor` FOREIGN KEY (`assessor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training_groups`
--

LOCK TABLES `training_groups` WRITE;
/*!40000 ALTER TABLE `training_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `training_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_type_id` (`type_id`),
  CONSTRAINT `fk_users_type` FOREIGN KEY (`type_id`) REFERENCES `users_types` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'Fábio Luís da Silva Santos','fabiosantos@ifsul.edu.br','$2y$10$4SAEgSOLVK8SBT9VP4T4lObFmZBPv48WLLMDb/Wsh5MC63zd6GBOO',NULL,1),(2,2,'Acessor 01','acessor-01@gmail.com','$2y$10$z6W9A.XI1CAyp8rGm8O9muY5g.DLbaAbKpv8bSuB1jLfyHeIVA14G','uploads/users/54cc43070c4fd4dbee70c472bba32478.png',1),(3,2,'Acessor 02 da Silva Santos','acessor-02@gmail.com','$2y$10$BEPaArDcCcjbdkobAIcDxeFWTn52PZKEaLevEDOszQOUkcclGROrm','uploads/users/c16ec2f799dcb99a1ab0a66e774f7603.png',1),(4,2,'Acessor 03 da Silva','acessor-2@gmail.com','$2y$10$s.xXwHzlICHb0Ebe/9Uc7ecLhj2u/.OlRjlNDGYzAF7acwupkSSwS','uploads/users/b80160dd23d998085a4d47456de9e3b4.png',1),(5,2,'Acessor 04 - da Silva','acessor-04@gmail.com','$2y$10$HAB4O4F3HemRCTnZNfZu7erKWvdc7pmGkJKt2R2WfYMB7/wCQRJDa',NULL,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_types`
--

DROP TABLE IF EXISTS `users_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_types_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_types`
--

LOCK TABLES `users_types` WRITE;
/*!40000 ALTER TABLE `users_types` DISABLE KEYS */;
INSERT INTO `users_types` VALUES (1,'ADMIN',1),(2,'TRAINER',1),(3,'ATHLETE',1);
/*!40000 ALTER TABLE `users_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workout_athletes`
--

DROP TABLE IF EXISTS `workout_athletes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_athletes` (
  `workout_id` int NOT NULL,
  `athlete_id` int NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'assigned',
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`workout_id`,`athlete_id`),
  KEY `idx_workout_athletes_athlete_id` (`athlete_id`),
  CONSTRAINT `fk_workout_athletes_athlete` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_workout_athletes_workout` FOREIGN KEY (`workout_id`) REFERENCES `workouts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_workout_athletes_status` CHECK ((`status` in (_utf8mb4'assigned',_utf8mb4'completed',_utf8mb4'skipped',_utf8mb4'cancelled')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_athletes`
--

LOCK TABLES `workout_athletes` WRITE;
/*!40000 ALTER TABLE `workout_athletes` DISABLE KEYS */;
/*!40000 ALTER TABLE `workout_athletes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workout_executions`
--

DROP TABLE IF EXISTS `workout_executions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_executions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workout_id` int NOT NULL,
  `athlete_id` int NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `distance_km` decimal(6,2) DEFAULT NULL,
  `duration_minutes` smallint unsigned DEFAULT NULL,
  `perceived_exertion` tinyint unsigned DEFAULT NULL,
  `feeling` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_workout_executions_workout_athlete` (`workout_id`,`athlete_id`),
  KEY `idx_workout_executions_athlete_id` (`athlete_id`),
  CONSTRAINT `fk_workout_executions_athlete` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_workout_executions_workout` FOREIGN KEY (`workout_id`) REFERENCES `workouts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_workout_executions_exertion` CHECK (((`perceived_exertion` is null) or (`perceived_exertion` between 1 and 10))),
  CONSTRAINT `chk_workout_executions_status` CHECK ((`status` in (_utf8mb4'completed',_utf8mb4'partial',_utf8mb4'not_completed')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_executions`
--

LOCK TABLES `workout_executions` WRITE;
/*!40000 ALTER TABLE `workout_executions` DISABLE KEYS */;
/*!40000 ALTER TABLE `workout_executions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workouts`
--

DROP TABLE IF EXISTS `workouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workouts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assessor_id` int NOT NULL,
  `training_group_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `scheduled_at` datetime NOT NULL,
  `distance_km` decimal(6,2) DEFAULT NULL,
  `pace_seconds_per_km` int unsigned DEFAULT NULL,
  `duration_minutes` smallint unsigned DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planned',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_workouts_assessor_id` (`assessor_id`),
  KEY `idx_workouts_group_id` (`training_group_id`),
  KEY `idx_workouts_scheduled_at` (`scheduled_at`),
  CONSTRAINT `fk_workouts_assessor` FOREIGN KEY (`assessor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_workouts_group` FOREIGN KEY (`training_group_id`) REFERENCES `training_groups` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_workouts_status` CHECK ((`status` in (_utf8mb4'planned',_utf8mb4'completed',_utf8mb4'pending',_utf8mb4'cancelled')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workouts`
--

LOCK TABLES `workouts` WRITE;
/*!40000 ALTER TABLE `workouts` DISABLE KEYS */;
/*!40000 ALTER TABLE `workouts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-16 15:09:56
