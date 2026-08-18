<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class Progress extends Model
{
    public function __construct()
    {
        $this->table = "workout_executions";
        $this->primaryKey = "id";
    }

    public function summaryForUser(int $userId): array
    {
        try {
            $query = "SELECT
                        COUNT(DISTINCT w.id) AS planned,
                        COUNT(DISTINCT CASE WHEN we.status = 'completed' THEN we.id END) AS completed,
                        COALESCE(SUM(CASE WHEN we.status IN ('completed', 'partial')
                                          THEN we.distance_km ELSE 0 END), 0) AS distance_km,
                        COALESCE(SUM(CASE WHEN we.status IN ('completed', 'partial')
                                          THEN we.duration_minutes ELSE 0 END), 0) AS duration_minutes
                      FROM workouts w
                      INNER JOIN workout_athletes wa ON wa.workout_id = w.id
                      INNER JOIN athletes a ON a.id = wa.athlete_id AND a.user_id = :user_id
                      LEFT JOIN workout_executions we
                        ON we.workout_id = w.id AND we.athlete_id = a.id
                      WHERE w.active = 1
                        AND w.scheduled_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
            $stmt->execute();
            $summary = $stmt->fetch() ?: (object)[];
            $planned = (int)($summary->planned ?? 0);
            $completed = (int)($summary->completed ?? 0);
            $summary->adherence = $planned > 0 ? round(($completed / $planned) * 100, 1) : 0;
            return (array)$summary;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return [];
        }
    }

    public function historyForUser(int $userId): array
    {
        try {
            $query = "SELECT DATE_FORMAT(COALESCE(we.executed_at, w.scheduled_at), '%Y-%m') AS period,
                             COUNT(we.id) AS executions,
                             COALESCE(SUM(we.distance_km), 0) AS distance_km,
                             COALESCE(SUM(we.duration_minutes), 0) AS duration_minutes
                      FROM workout_executions we
                      INNER JOIN workouts w ON w.id = we.workout_id
                      INNER JOIN athletes a ON a.id = we.athlete_id AND a.user_id = :user_id
                      GROUP BY period
                      ORDER BY period DESC
                      LIMIT 12";
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
