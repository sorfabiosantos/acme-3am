<?php

namespace Source\Models;

use PDO;
use PDOException;
use Source\Core\Model;
use Source\Core\Connect;

class Sale extends Model
{
    private ?int $id;
    private ?int $userId;
    private ?int $vehicleId;
    private ?string $name;
    private ?int $active;

    public function __construct(?int $id = null, ?int $userId = null, ?int $vehicleId = null, ?string $name = null, ?int $active = 1)
    {
        $this->id = $id;
        $this->userId = $userId;
        $this->vehicleId = $vehicleId;
        $this->name = $name;
        $this->active = $active;

        $this->table = 'sales';
        $this->primaryKey = 'id';
        $this->fillable = ['userId', 'vehicleId', 'name', 'active'];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function setUserId(?int $userId): void
    {
        $this->userId = $userId;
    }

    public function getVehicleId(): ?int
    {
        return $this->vehicleId;
    }

    public function setVehicleId(?int $vehicleId): void
    {
        $this->vehicleId = $vehicleId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(?int $active): void
    {
        $this->active = $active;
    }

    public function selectAll(array $filters = [], ?string $orderBy = 'id', string $direction = 'ASC'): array
    {
        try {
            $query = "SELECT sales.*, users.name AS user_name, vehicles.title AS vehicle_title
                      FROM sales
                      JOIN users ON sales.user_id = users.id
                      JOIN vehicles ON sales.vehicle_id = vehicles.id";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return [];
        }
    }

    public function selectByIdWithJoin(int $id): ?object
    {
        try {
            $query = "SELECT sales.*, users.name AS user_name, vehicles.title AS vehicle_title
                      FROM sales
                      JOIN users ON sales.user_id = users.id
                      JOIN vehicles ON sales.vehicle_id = vehicles.id
                      WHERE sales.id = :id LIMIT 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch();
            return $result ?: null;
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return null;
        }
    }
}
