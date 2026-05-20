<?php

namespace source\Controller;

use Source\Controller\Api;
use Source\Models\Product;

class Products extends Api
{
    public function productsList (): void
    {
        $products = new Product();
        $this->call(200,"success","Lista de Produtos","success")->back($products->listAll());
    }

    public function productsListById (array $data): void
    {
        if(!filter_var($data["productId"], FILTER_VALIDATE_INT)){
            $this->call(
                400,
                "bad_request",
                "ID do produto é obrigatório e deve ser um número inteiro",
                "error"
            )->back();
            return;
        }

        $product = new Product();
        $product = $product->listById($data["productId"]);

        if(!$product){
            $this->call(
                404,
                "not_found",
                "Produto não encontrado",
                "error"
            )->back();
            return;
        }

        $this->call(200,"success","Produto encontrado","success")
            ->back($product);

    }

    public function insert (array $data): void
    {

        if(!isset($data["name"]) || empty($data["name"]) ||
           !isset($data["price"]) || empty($data["price"]) ||
           !isset($data["categoryId"]) || empty($data["categoryId"])){
            $this->call("400","bad_request","Os campos nome, preço e categoria são obrigatórios", "error")
            ->back();
            return;
        }

        $product = new Product(
            null,
            $data["categoryId"],
            $data["name"],
            $data["price"]
        );
        if(!$product->insert()){
            // erro
        }

        $response = [
            "id" => $product->getId(),
            "categoryId" => $product->getCategoryId(),
            "name" => $product->getName(),
            "price" => $product->getPrice()
        ];

        $this->call("201","created","Produto criado com sucesso","success")
            ->back($response);
    }

    public function update(array $data)
    {
        echo "Atualizar Produto";
        var_dump($data);
    }

    public function delete(array $data)
    {
        echo "Deletar Produto";
        var_dump($data);
    }

}