<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Address;

class Addresses extends Api
{
    public function register (array $data): void
    {
        if(!$this->authToken(2)){
            $this->call(401, "unauthorized", "Acesso negado", "error")->back();
            return;
        }
        // persistência de dados
        $address = new Address(null, $this->userAuthId, $data["street"], $data["number"]);
        if(!$address->insert()){
            $this->call(500, "internal_server_error", "Alguma coisa aconteceu - {$address->getErrorMessage()}", "error")->back();
            return;
        }
        $this->call(201, "created", "Endereço registrado com sucesso", "success")->back();
    }

    public function update(array $data): void
    {
        if(!$this->authToken(2)){
            $this->call(401, "unauthorized", "Acesso negado", "error")->back();
            return;
        }

        $address = new Address(null, $this->userAuthId, $data["street"], $data["number"]);
        if(!$address->updateById($data["id"])){
            $this->call(500, "internal_server_error", "Alguma coisa aconteceu - {$address->getErrorMessage()}", "error")->back();
            return;
        }
        $this->call(200, "success", "Endereço alterado com sucesso", "success")->back();
    }

}