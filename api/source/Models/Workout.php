<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class Workout extends Model
{
    public function __construct()
    {
        $this->table = "workouts";
        $this->primaryKey = "id";
    }

    public function selectForUser(int $userId): array
    {
        try {
            $query = "SELECT w.*, tg.name AS group_name, wa.status AS assignment_status,
                             we.id AS execution_id, we.executed_at, we.distance_km AS executed_distance_km,
                             we.duration_minutes AS executed_duration_minutes,
                             we.perceived_exertion, we.feeling, we.notes AS execution_notes,
                             we.status AS execution_status, a.id AS athlete_id
                      FROM workouts w
                      INNER JOIN workout_athletes wa ON wa.workout_id = w.id
                      INNER JOIN athletes a ON a.id = wa.athlete_id AND a.user_id = :user_id
                      LEFT JOIN training_groups tg ON tg.id = w.training_group_id
                      LEFT JOIN workout_executions we
                        ON we.workout_id = w.id AND we.athlete_id = a.id
                      WHERE w.active = 1
                      ORDER BY w.scheduled_at ASC";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return [];
        }
    }

    public function selectOneForUser(int $userId, int $workoutId): ?object
    {
        try {
            $query = "SELECT w.*, tg.name AS group_name, wa.status AS assignment_status,
                             we.id AS execution_id, we.executed_at, we.distance_km AS executed_distance_km,
                             we.duration_minutes AS executed_duration_minutes,
                             we.perceived_exertion, we.feeling, we.notes AS execution_notes,
                             we.status AS execution_status, a.id AS athlete_id
                      FROM workouts w
                      INNER JOIN workout_athletes wa ON wa.workout_id = w.id
                      INNER JOIN athletes a ON a.id = wa.athlete_id AND a.user_id = :user_id
                      LEFT JOIN training_groups tg ON tg.id = w.training_group_id
                      LEFT JOIN workout_executions we
                        ON we.workout_id = w.id AND we.athlete_id = a.id
                      WHERE w.id = :workout_id AND w.active = 1
                      LIMIT 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
            $stmt->bindValue(":workout_id", $workoutId, PDO::PARAM_INT);
            $stmt->execute();
            $workout = $stmt->fetch();
            return $workout ?: null;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return null;
        }
    }

    public function saveExecution(int $workoutId, int $athleteId, array $execution): bool
    {
        try {
            $query = "INSERT INTO workout_executions
                        (workout_id, athlete_id, executed_at, distance_km, duration_minutes,
                         perceived_exertion, feeling, notes, status)
                      VALUES
                        (:workout_id, :athlete_id, :executed_at, :distance_km, :duration_minutes,
                         :perceived_exertion, :feeling, :notes, :status)
                      ON DUPLICATE KEY UPDATE
                        executed_at = VALUES(executed_at),
                        distance_km = VALUES(distance_km),
                        duration_minutes = VALUES(duration_minutes),
                        perceived_exertion = VALUES(perceived_exertion),
                        feeling = VALUES(feeling),
                        notes = VALUES(notes),
                        status = VALUES(status)";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":workout_id", $workoutId, PDO::PARAM_INT);
            $stmt->bindValue(":athlete_id", $athleteId, PDO::PARAM_INT);
            $stmt->bindValue(":executed_at", $execution["executed_at"] ?? null);
            $stmt->bindValue(":distance_km", $execution["distance_km"] ?? null);
            $stmt->bindValue(":duration_minutes", $execution["duration_minutes"] ?? null);
            $stmt->bindValue(":perceived_exertion", $execution["perceived_exertion"] ?? null);
            $stmt->bindValue(":feeling", $execution["feeling"] ?? null);
            $stmt->bindValue(":notes", $execution["notes"] ?? null);
            $stmt->bindValue(":status", $execution["status"]);
            return $stmt->execute();
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }

    public function selectExecutionsForUser(int $userId): array
    {
        try {
            $query = "SELECT we.*, we.workout_id, w.title, w.scheduled_at
                      FROM workout_executions we
                      INNER JOIN workouts w ON w.id = we.workout_id
                      INNER JOIN athletes a ON a.id = we.athlete_id AND a.user_id = :user_id
                      ORDER BY COALESCE(we.executed_at, w.scheduled_at) DESC";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return [];
        }
    }
}
