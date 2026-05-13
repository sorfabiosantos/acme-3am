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

    }

}