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
        $product = new Product();

        if($product->productById($data["productId"])){
            $this->call(200,"success","Produto encontrado","success")
                ->back(array ($product->productById($data["productId"])));
        } else {
            $this->call(404,"not_found","Produto não encontrado","error")->back();
        }

        //var_dump($product->productById($data["productId"]));
        //$this->call(200,"success","Produto encontrado","success")
        //    ->back(array ($product->productById($data["productId"])));
    }

}