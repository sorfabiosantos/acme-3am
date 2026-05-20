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

    public function create (array $data): void
    {
        //var_dump($data["name"], $data["price"], $data["categoryId"]);
        if(!isset($data["name"]) || empty($data["name"]) ||
           !isset($data["price"]) || empty($data["price"])){
            $this->call(
                400,
                "bad_request",
                "Os campos name, price e category_id são obrigatórios",
                "error"
            )->back();
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

        $this->call(201,"created","Produto cadastrado","success")
            ->back($response);

    }

    public function update (array $data): void
    {
        echo "Atualizar produto";
        var_dump($data);
    }

    public function delete (array $data)
    {
        echo "Deletar produto";
        var_dump($data);
    }

}