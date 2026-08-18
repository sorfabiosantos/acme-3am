<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class Race extends Model
{
    public function __construct()
    {
        $this->table = "races";
        $this->primaryKey = "id";
    }

    public function selectForUser(int $userId): array
    {
        try {
            $query = "SELECT r.*, ar.status, ar.result_time_seconds, ar.notes,
                             ar.registered_at
                      FROM races r
                      INNER JOIN athlete_races ar ON ar.race_id = r.id
                      INNER JOIN athletes a ON a.id = ar.athlete_id AND a.user_id = :user_id
                      WHERE r.active = 1
                      ORDER BY r.race_date ASC";
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
