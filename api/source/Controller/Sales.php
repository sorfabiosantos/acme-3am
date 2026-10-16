<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Sale;

class Sales extends Api
{
    public function listAll(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        $sale = new Sale();
        $this->call(200, "success", "Lista de Vendas", "success")
            ->back($sale->selectAll());
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, "unauthorized", "Usuário não está autenticado (sem token ou token inválido).", "error")->back();
            return;
        }

        if (!isset($data["vehicle_id"]) || empty($data["vehicle_id"]) || !filter_var($data["vehicle_id"], FILTER_VALIDATE_INT) ||
            !isset($data["name"]) || empty(trim($data["name"]))) {
            $this->call(400, "bad_request", "Os campos vehicle_id e name são obrigatórios. O campo vehicle_id deve ser um número inteiro", "error")->back();
            return;
        }

        $sale = new Sale(null, $this->userAuthId, (int)$data["vehicle_id"], $data["name"], 1);
        if (!$sale->insert()) {
            $this->call(500, "internal_server_error", $sale->getErrorMessage(), "error")->back();
            return;
        }

        $created = $sale->selectByIdWithJoin($sale->getId());

        $this->call(201, "created", "Venda criada com sucesso", "success")->back($created);
    }
}
