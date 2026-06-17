<?php

namespace Source\Controller;

use Source\Controller\Api;
use Source\Models\Address;

class Addresses extends Api
{
    public function register (array $data): void
    {
        if(!$this->authToken(2)){
            $this->call(401, "error", "Acesso negado", "error")->back();
            return;
        }
        // persistência de dados
        $address = new Address(null, $this->userAuthId, $data["street"], $data["number"]);
        if(!$address->insert()){
            $this->call(500, "error", "Alguma coisa aconteceu - {$address->getErrorMessage()}", "error")->back();
            return;
        }
        $this->call(200, "success", "Endereço registrado com sucesso", "success")->back();
    }

    public function update(array $data): void
    {
        var_dump($data);
        echo "oi...";
    }

}