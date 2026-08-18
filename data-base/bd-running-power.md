# Banco de dados Running Power

Nome do banco: `db-running-power`

Modelo relacional inicial do Running Power, com as entidades já utilizadas pela
autenticação e pelo painel administrativo, além do domínio previsto para
assessores, atletas, treinos e provas.

O script abaixo contém somente a estrutura das tabelas. Não inclui dados de
desenvolvimento, credenciais ou registros do dump legado.

## Observações

- Banco compatível com MySQL 8.0.
- As tabelas usam InnoDB, `utf8mb4` e nomes de colunas em `snake_case`.
- Os tipos de usuário previstos são `ADMIN`, `TRAINER` e `ATHLETE`.
- A senha de `users.password` deve armazenar o hash gerado por `password_hash`.
- As tabelas devem ser criadas na ordem apresentada por causa das chaves estrangeiras.

## Estrutura

```sql
CREATE DATABASE IF NOT EXISTS `db-running-power`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `db-running-power`;

CREATE TABLE `users_types` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_types_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `type_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `photo` VARCHAR(255) DEFAULT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_email` (`email`),
    KEY `idx_users_type_id` (`type_id`),
    CONSTRAINT `fk_users_type`
        FOREIGN KEY (`type_id`) REFERENCES `users_types` (`id`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `faqs_categories` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_faqs_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `faqs` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `faqs_category_id` INT NOT NULL,
    `question` VARCHAR(255) NOT NULL,
    `answer` VARCHAR(255) NOT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    KEY `idx_faqs_category_id` (`faqs_category_id`),
    KEY `idx_faqs_active` (`active`),
    CONSTRAINT `fk_faqs_category`
        FOREIGN KEY (`faqs_category_id`) REFERENCES `faqs_categories` (`id`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `athletes` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `assessor_id` INT NOT NULL,
    `user_id` INT DEFAULT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `goal` VARCHAR(255) DEFAULT NULL,
    `level` VARCHAR(50) DEFAULT NULL,
    `availability` VARCHAR(255) DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_athletes_user_id` (`user_id`),
    KEY `idx_athletes_assessor_id` (`assessor_id`),
    CONSTRAINT `fk_athletes_assessor`
        FOREIGN KEY (`assessor_id`) REFERENCES `users` (`id`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT `fk_athletes_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `training_groups` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `assessor_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `objective` VARCHAR(255) DEFAULT NULL,
    `level` VARCHAR(50) DEFAULT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_training_groups_assessor_name` (`assessor_id`, `name`),
    KEY `idx_training_groups_assessor_id` (`assessor_id`),
    CONSTRAINT `fk_training_groups_assessor`
        FOREIGN KEY (`assessor_id`) REFERENCES `users` (`id`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `athlete_groups` (
    `athlete_id` INT NOT NULL,
    `training_group_id` INT NOT NULL,
    `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`athlete_id`, `training_group_id`),
    KEY `idx_athlete_groups_group_id` (`training_group_id`),
    CONSTRAINT `fk_athlete_groups_athlete`
        FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT `fk_athlete_groups_group`
        FOREIGN KEY (`training_group_id`) REFERENCES `training_groups` (`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `workouts` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `assessor_id` INT NOT NULL,
    `training_group_id` INT DEFAULT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `scheduled_at` DATETIME NOT NULL,
    `distance_km` DECIMAL(6,2) DEFAULT NULL,
    `pace_seconds_per_km` INT UNSIGNED DEFAULT NULL,
    `duration_minutes` SMALLINT UNSIGNED DEFAULT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'planned',
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_workouts_assessor_id` (`assessor_id`),
    KEY `idx_workouts_group_id` (`training_group_id`),
    KEY `idx_workouts_scheduled_at` (`scheduled_at`),
    CONSTRAINT `chk_workouts_status`
        CHECK (`status` IN ('planned', 'completed', 'pending', 'cancelled')),
    CONSTRAINT `fk_workouts_assessor`
        FOREIGN KEY (`assessor_id`) REFERENCES `users` (`id`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT `fk_workouts_group`
        FOREIGN KEY (`training_group_id`) REFERENCES `training_groups` (`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `workout_athletes` (
    `workout_id` INT NOT NULL,
    `athlete_id` INT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'assigned',
    `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`workout_id`, `athlete_id`),
    KEY `idx_workout_athletes_athlete_id` (`athlete_id`),
    CONSTRAINT `chk_workout_athletes_status`
        CHECK (`status` IN ('assigned', 'completed', 'skipped', 'cancelled')),
    CONSTRAINT `fk_workout_athletes_workout`
        FOREIGN KEY (`workout_id`) REFERENCES `workouts` (`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT `fk_workout_athletes_athlete`
        FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `workout_executions` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `workout_id` INT NOT NULL,
    `athlete_id` INT NOT NULL,
    `executed_at` DATETIME DEFAULT NULL,
    `distance_km` DECIMAL(6,2) DEFAULT NULL,
    `duration_minutes` SMALLINT UNSIGNED DEFAULT NULL,
    `perceived_exertion` TINYINT UNSIGNED DEFAULT NULL,
    `feeling` VARCHAR(50) DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'completed',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_workout_executions_workout_athlete` (`workout_id`, `athlete_id`),
    KEY `idx_workout_executions_athlete_id` (`athlete_id`),
    CONSTRAINT `chk_workout_executions_exertion`
        CHECK (`perceived_exertion` IS NULL OR `perceived_exertion` BETWEEN 1 AND 10),
    CONSTRAINT `chk_workout_executions_status`
        CHECK (`status` IN ('completed', 'partial', 'not_completed')),
    CONSTRAINT `fk_workout_executions_workout`
        FOREIGN KEY (`workout_id`) REFERENCES `workouts` (`id`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT `fk_workout_executions_athlete`
        FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `races` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `assessor_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) DEFAULT NULL,
    `race_date` DATE NOT NULL,
    `distance_km` DECIMAL(6,2) DEFAULT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_races_assessor_id` (`assessor_id`),
    KEY `idx_races_date` (`race_date`),
    CONSTRAINT `fk_races_assessor`
        FOREIGN KEY (`assessor_id`) REFERENCES `users` (`id`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `athlete_races` (
    `athlete_id` INT NOT NULL,
    `race_id` INT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'registered',
    `result_time_seconds` INT UNSIGNED DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `registered_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`athlete_id`, `race_id`),
    KEY `idx_athlete_races_race_id` (`race_id`),
    CONSTRAINT `chk_athlete_races_status`
        CHECK (`status` IN ('registered', 'completed', 'dns', 'dnf', 'cancelled')),
    CONSTRAINT `fk_athlete_races_athlete`
        FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT `fk_athlete_races_race`
        FOREIGN KEY (`race_id`) REFERENCES `races` (`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```