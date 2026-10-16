<?php

namespace Source\Controller;

use Source\Models\User;
use Source\Support\Upload;

class Users extends Api
{
    public function register (array $data): void
    {
        if(!isset($data['password']) || empty($data['password'])) {
            $this->call(400,
                "bad_request",
                "A senha é obrigatória.",
                "error")->back();
            return;
        }

        if(!$this->validateNameEmail($data)){
            $this->call(400,
                "bad_request",
                "Nome e e-mail são obrigatórios. O e-mail deve ser válido.",
                "error")->back();
            return;
        }

        $user = new User(
            null,
            2,
            $data['name'],
            $data['email'],
            $data['password']
        );

        if(!$user->insert()) {
            $this->call(500, "internal_server_error", $user->getErrorMessage(), "error")->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "name" => $user->getName(),
            "email" => $user->getEmail()
        ];

        $this->call(201,"success","Usuário inserido com sucesso","created")->back($response);
    }

    public function auth (array $data): void
    {
        if(!isset($data['email'], $data['password']) ||
            empty($data['email']) || empty($data['password']) ||
            !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha são obrigatórios. O e-mail deve ser válido.",
                "error")->back();
            return;
        }

        $user = new User();
        if(!$user->login($data['email'], $data['password'])) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage(),
                "error")->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "name" => $user->getName(),
            "photo" => $user->getPhoto(),
            "type_id" => $user->getTypeId(),
            "token" => $user->getToken(),
        ];

        $this->call(
            200,
            "success",
            "Usuário logado com sucesso",
            "success")->back($response);
    }

    public function authAthlete (array $data): void
    {
        if (!$this->validateCredentials($data)) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha são obrigatórios. O e-mail deve ser válido.",
                "error"
            )->back();
            return;
        }

        $user = new User();
        if (!$user->login($data["email"], $data["password"], 3)) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage() ?: "Credenciais inválidas ou conta inativa.",
                "error"
            )->back();
            return;
        }

        $this->call(
            200,
            "success",
            "Acesso do corredor realizado com sucesso",
            "success"
        )->back([
            "id" => $user->getId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $user->getPhoto(),
            "type_id" => $user->getTypeId(),
            "token" => $user->getToken()
        ]);
    }

    public function authAdmin (array $data): void
    {
        if(!isset($data['email'], $data['password']) ||
            empty($data['email']) || empty($data['password']) ||
            !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->call(
                400,
                "bad_request",
                "E-mail e senha são obrigatórios. O e-mail deve ser válido.",
                "error")->back();
            return;
        }

        $user = new User();
        if(!$user->login($data['email'], $data['password'], 1)) {
            $this->call(
                401,
                "unauthorized",
                $user->getErrorMessage(),
                "error")->back();
            return;
        }

        $response = [
            "id" => $user->getId(),
            "name" => $user->getName(),
            "photo" => $user->getPhoto(),
            "type_id" => $user->getTypeId(),
            "token" => $user->getToken(),
        ];

        $this->call(
            200,
            "success",
            "Usuário logado com sucesso",
            "success")->back($response);
    }

    public function update (array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(
                401,
                "unauthorized",
                "Usuário não está autenticado (sem token ou token inválido).",
                "error"
            )->back();
            return;
        }

        $name = isset($data["name"]) && is_string($data["name"]) ? trim($data["name"]) : "";
        $email = isset($data["email"]) && is_string($data["email"]) ? trim($data["email"]) : "";
        if ($name === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->call(400, "bad_request", "Informe um nome e um e-mail válido.", "error")->back();
            return;
        }

        $passwordFieldsProvided = array_key_exists("current_password", $data) || array_key_exists("new_password", $data);
        $currentPassword = null;
        $newPassword = null;
        if ($passwordFieldsProvided) {
            $currentPassword = $data["current_password"] ?? null;
            $newPassword = $data["new_password"] ?? null;
            if (!is_string($currentPassword) || $currentPassword === "" ||
                !is_string($newPassword) || strlen($newPassword) < 8) {
                $this->call(400, "bad_request", "Informe a senha atual e uma nova senha com pelo menos 8 caracteres.", "error")->back();
                return;
            }
        }

        $user = new User();
        if (!$user->updateProfile($this->userAuthId, $name, $email, $currentPassword, $newPassword)) {
            $message = $user->getErrorMessage() ?? "Não foi possível atualizar o perfil.";
            $code = match ($message) {
                "Perfil não encontrado." => 404,
                "Este e-mail já está cadastrado." => 409,
                "A senha atual está incorreta." => 400,
                default => 500,
            };
            $status = match ($code) {
                400 => "bad_request",
                404 => "not_found",
                409 => "conflict",
                default => "internal_server_error",
            };
            $this->call($code, $status, $message, "error")->back();
            return;
        }

        $this->call(200, "success", "Perfil atualizado com sucesso.", "success")->back([
            "id" => $user->getId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $user->getPhoto(),
            "token" => $user->getToken(),
        ]);
    }

    public function me(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->selectById($this->userAuthId)) {
            $this->call(404, "not_found", "Perfil não encontrado.", "error")->back();
            return;
        }

        $this->call(200, "success", "Perfil carregado com sucesso.", "success")->back([
            "id" => $user->getId(),
            "name" => $user->getName(),
            "email" => $user->getEmail(),
            "photo" => $user->getPhoto(),
        ]);
    }

    public function updateAdmin (array $data): void
    {
        if(!$this->authToken (1)){
            $this->call(
                401,
                "unauthorized",
                "Usuário não está autenticado (sem token ou token inválido).",
                "error")->back();
            return;
        }
        // validar campos
        // fazer o update do usuário ADMIN agora autenticado
        $this->call(
            200,
            "success",
            "Usuário atualizado com sucesso",
            "success")->back();

    }

    public function uploadPhoto (array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        if (!isset($_FILES["photo"]) || !is_array($_FILES["photo"])) {
            $this->call(400, "bad_request", "Selecione uma imagem para enviar.", "error")->back();
            return;
        }

        $user = new User();
        if (!$user->selectById($this->userAuthId)) {
            $this->call(404, "not_found", "Perfil não encontrado.", "error")->back();
            return;
        }
        $oldPhoto = $user->getPhoto();

        $uploadDirectory = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . "users";
        $uploader = new Upload($uploadDirectory);
        try {
            $filename = $uploader->image($_FILES["photo"]);
        } catch (\RuntimeException $exception) {
            $this->call(400, "bad_request", $exception->getMessage(), "error")->back();
            return;
        }

        $photoUrl = url("uploads/users/" . $filename);
        if (!$user->updatePhoto($this->userAuthId, $photoUrl)) {
            $savedPath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
            if (is_file($savedPath) && !unlink($savedPath)) {
                error_log("Não foi possível remover a foto enviada após falha ao atualizar o perfil.");
            }
            $this->call(500, "internal_server_error", $user->getErrorMessage() ?? "Não foi possível atualizar a foto.", "error")->back();
            return;
        }

        $this->deletePreviousPhoto($oldPhoto, $uploadDirectory);

        $this->call(200, "success", "Foto atualizada com sucesso.", "success")->back([
            "photo" => $photoUrl,
        ]);
    }

    private function deletePreviousPhoto(?string $photoUrl, string $uploadDirectory): void
    {
        if ($photoUrl === null || $photoUrl === "") {
            return;
        }

        $photoPath = parse_url($photoUrl, PHP_URL_PATH);
        $uploadsUrlPath = parse_url(url("uploads/users/"), PHP_URL_PATH);
        if (!is_string($photoPath) || !is_string($uploadsUrlPath)) {
            return;
        }

        $managedPrefix = rtrim($uploadsUrlPath, "/") . "/";
        if (!str_starts_with($photoPath, $managedPrefix)) {
            return;
        }

        $filename = substr($photoPath, strlen($managedPrefix));
        if (!preg_match('/\A[a-f0-9]{32}\.(?:jpg|png|webp)\z/', $filename)) {
            return;
        }

        $oldFilePath = $uploadDirectory . DIRECTORY_SEPARATOR . $filename;
        if (is_file($oldFilePath) && !unlink($oldFilePath)) {
            error_log("Não foi possível remover a foto antiga do perfil.");
        }
    }

    // Valida somente Nome e Email, mas pode ser alterada para validar mais campos
    private function validateNameEmail(array $data): bool
    {
        if(!isset($data["name"],$data["email"]) ||
            empty($data["name"]) || empty($data["email"]) ||
            !filter_var($data["email"], FILTER_VALIDATE_EMAIL)) {
            return false;
        }
        return true;
    }

    private function validateCredentials(array $data): bool
    {
        return isset($data["email"], $data["password"]) &&
            filter_var($data["email"], FILTER_VALIDATE_EMAIL) &&
            trim((string)$data["password"]) !== "";
    }
}