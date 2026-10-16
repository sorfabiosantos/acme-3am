<?php

namespace Source\Models;

use PDO;
use Source\Core\Model;
use Source\Core\Connect;
use Source\Core\JWTToken;

class User extends Model
{
    private ?int $id;
    private ?int $typeId;
    private ?string $name;
    private ?string $email;
    private ?string $password;
    private ?string $photo;
    private ?int $active;

    private ?string $token = null;

    public function __construct(?int $id = null, ?int $typeId = null, ?string $name = null, ?string $email = null, ?string $password = null, ?string $photo = null)
    {
        $this->id = $id;
        $this->typeId = $typeId;
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
        $this->photo = $photo;

        $this->table = 'users'; // nome da tabela do banco
        $this->primaryKey = 'id'; // nome da chave primária da tabela
        $this->fillable = ['typeId', 'name', 'email', 'password', 'photo', 'active']; // camelCase
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getTypeId(): ?int
    {
        return $this->typeId;
    }

    public function setTypeId(?int $typeId): void
    {
        $this->typeId = $typeId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): void
    {
        $this->email = $email;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(?string $password): void
    {
        $this->password = $password;
    }

    public function getPhoto(): ?string
    {
        return $this->photo;
    }

    public function setPhoto(?string $photo): void
    {
        $this->photo = $photo;
    }

    public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(?int $active): void
    {
        $this->active = $active;
    }

    public function updateProfile(
        int $id,
        string $name,
        string $email,
        ?string $currentPassword = null,
        ?string $newPassword = null
    ): bool {
        try {
            $query = "SELECT password, photo FROM {$this->table} WHERE id = :id AND type_id = 2 AND active = 1 LIMIT 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            $currentUser = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$currentUser) {
                $this->errorMessage = "Perfil não encontrado.";
                return false;
            }

            $query = "SELECT id FROM {$this->table} WHERE email = :email AND id <> :id LIMIT 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":email", $email);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            if ($stmt->fetch(PDO::FETCH_ASSOC)) {
                $this->errorMessage = "Este e-mail já está cadastrado.";
                return false;
            }

            if ($currentPassword !== null || $newPassword !== null) {
                if ($currentPassword === null || $newPassword === null || strlen($newPassword) < 8) {
                    $this->errorMessage = "Informe a senha atual e uma nova senha com pelo menos 8 caracteres.";
                    return false;
                }

                if (!password_verify($currentPassword, $currentUser["password"])) {
                    $this->errorMessage = "A senha atual está incorreta.";
                    return false;
                }
            }

            $params = [
                ":name" => $name,
                ":email" => $email,
                ":id" => $id,
            ];
            $setParts = ["name = :name", "email = :email"];
            if ($newPassword !== null) {
                $setParts[] = "password = :password";
                $params[":password"] = password_hash($newPassword, PASSWORD_DEFAULT);
            }

            $query = "UPDATE {$this->table} SET " . implode(", ", $setParts) . " WHERE id = :id AND type_id = 2 AND active = 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute($params);

            $this->id = $id;
            $this->typeId = 2;
            $this->name = $name;
            $this->email = $email;
            $this->photo = $currentUser["photo"];
            $this->token = (new JWTToken())->encode([
                "id" => $id,
                "name" => $name,
                "email" => $email,
                "type_id" => 2,
            ]);

            return true;
        } catch (\PDOException $exception) {
            $this->errorMessage = (string)$exception->getCode() === "23000"
                ? "Este e-mail já está cadastrado."
                : "Não foi possível atualizar o perfil.";
            return false;
        }
    }

    public function updatePhoto(int $id, string $photo): bool
    {
        try {
            $query = "UPDATE {$this->table} SET photo = :photo WHERE id = :id AND type_id = 2 AND active = 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(":photo", $photo);
            $stmt->bindValue(":id", $id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() !== 1) {
                $this->errorMessage = "Perfil não encontrado ou foto não alterada.";
                return false;
            }

            $this->id = $id;
            $this->photo = $photo;
            return true;
        } catch (\PDOException $exception) {
            $this->errorMessage = "Não foi possível atualizar a foto do perfil.";
            return false;
        }
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function insert (): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();
        if($stmt->rowCount() > 0){
            $this->errorMessage = "Email já cadastrado";
            return false;
        }
        $this->password = password_hash($this->password, PASSWORD_DEFAULT);

        if(!parent::insert()){
            $this->errorMessage = "Algo deu errado";
            return false;
        }
        return true;
    }

    public function login (string $email, string $password, int $typeId = 2): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email AND type_id = :typeId AND active = 1";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":typeId", $typeId);
        $stmt->execute();
        if($stmt->rowCount() == 0){
            $this->errorMessage = "Email não cadastrado";
            return false;
        }
        $user = $stmt->fetch();
        if(!password_verify($password, $user->password)){
            $this->errorMessage = "Senha incorreta";
            return false;
        }
        $this->id = $user->id;
        $this->typeId = $user->type_id;
        $this->name = $user->name;
        $this->email = $user->email;
        $this->photo = $user->photo;
        $this->active = (int)$user->active;
        $jwt = new JWTToken();
        // definir quais informações irão par o payload do token
        $this->token = $jwt->encode([
            "id" => $user->id,
            "name" => $user->name,
            "email" => $user->email,
            "type_id" => $user->type_id
        ]);
        return true;
    }

    public function permissionVerify (string $email, $typeId): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email AND type_id = :typeId AND active = 1";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":typeId", $typeId);
        $stmt->execute();
        if($stmt->rowCount() == 0) {
            return false;
        }
        return true;
    }

}