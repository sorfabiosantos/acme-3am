<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Connect;
use Source\Core\Model;

class Athlete extends Model
{
    public function __construct()
    {
        $this->table = "athletes";
        $this->primaryKey = "id";
    }

    public function selectByUserId(int $userId): ?object
    {
        try {
            $query = "SELECT a.*, assessor.name AS assessor_name, assessor.email AS assessor_email
                      FROM athletes a
                      INNER JOIN users assessor ON assessor.id = a.assessor_id
                      WHERE a.user_id = :user_id AND a.active = 1
                      LIMIT 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
            $stmt->execute();
            $athlete = $stmt->fetch();
            return $athlete ?: null;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return null;
        }
    }

    public function updateByUserId(int $userId, array $data): bool
    {
        $allowed = ["name", "email", "goal", "level", "availability", "notes"];
        $fields = array_intersect_key($data, array_flip($allowed));
        $fields = array_filter($fields, static fn ($value) => $value !== null);

        if (!$fields) {
            $this->errorMessage = "Nenhum campo permitido para atualização.";
            return false;
        }

        try {
            $set = [];
            foreach (array_keys($fields) as $field) {
                $set[] = "{$field} = :{$field}";
            }

            $query = "UPDATE athletes SET " . implode(", ", $set) . "
                      WHERE user_id = :user_id AND active = 1";
            $stmt = Connect::getInstance()->prepare($query);
            foreach ($fields as $field => $value) {
                $stmt->bindValue(":{$field}", $value);
            }
            $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() < 1) {
                $this->errorMessage = "Perfil não encontrado ou sem alterações.";
                return false;
            }

            return true;
        } catch (PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return false;
        }
    }
}
