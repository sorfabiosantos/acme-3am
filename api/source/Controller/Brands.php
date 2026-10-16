<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Brand;

class Brands extends Api
{
    public function listAll(array $data): void
    {
        $brand = new Brand();
        $this->call(200, "success", "Lista de Marcas", "success")
            ->back($brand->selectAll());
    }

    public function listById(array $data): void
    {
        if (!isset($data["brandId"]) || empty($data["brandId"]) || !filter_var($data["brandId"], FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da marca é obrigatório e deve ser um número inteiro", "error")->back();
            return;
        }

        $brand = new Brand();
        if (!$brand->selectById((int)$data["brandId"])) {
            $this->call(404, "not_found", "Marca não encontrada", "error")->back();
            return;
        }

        $response = [
            "id" => $brand->getId(),
            "name" => $brand->getName(),
            "active" => $brand->getActive()
        ];

        $this->call(200, "success", "Marca encontrada", "success")->back($response);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        if (!isset($data["name"]) || empty(trim($data["name"]))) {
            $this->call(400, "bad_request", "O campo name é obrigatório", "error")->back();
            return;
        }

        $brand = new Brand(null, $data["name"], 1);
        if (!$brand->insert()) {
            $this->call(500, "internal_server_error", $brand->getErrorMessage(), "error")->back();
            return;
        }

        $response = [
            "id" => $brand->getId(),
            "name" => $brand->getName(),
            "active" => $brand->getActive()
        ];

        $this->call(201, "created", "Marca criada com sucesso", "success")->back($response);
    }

    public function update(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        if (!isset($data["brandId"]) || !filter_var($data["brandId"], FILTER_VALIDATE_INT) ||
            !isset($data["name"]) || empty(trim($data["name"]))) {
            $this->call(400, "bad_request", "Os campos name e brandId são obrigatórios. O campo brandId deve ser um número inteiro", "error")->back();
            return;
        }

        $brand = new Brand();
        if (!$brand->selectById((int)$data["brandId"])) {
            $this->call(404, "not_found", "Marca não encontrada", "error")->back();
            return;
        }

        $brand->setName($data["name"]);
        if (!$brand->updateById((int)$data["brandId"])) {
            $this->call(500, "internal_server_error", $brand->getErrorMessage(), "error")->back();
            return;
        }

        $response = [
            "id" => $brand->getId(),
            "name" => $brand->getName(),
            "active" => $brand->getActive()
        ];

        $this->call(200, "success", "Marca atualizada com sucesso", "success")->back($response);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        if (!isset($data["brandId"]) || !filter_var($data["brandId"], FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da marca é obrigatório e deve ser um número inteiro", "error")->back();
            return;
        }

        $brand = new Brand();
        if (!$brand->softDeleteById((int)$data["brandId"])) {
            $this->call(404, "not_found", "Marca não encontrada ou já inativa", "error")->back();
            return;
        }

        $this->call(200, "success", "Marca removida com sucesso", "success")->back();
    }
}
