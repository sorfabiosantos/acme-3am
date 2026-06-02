<?php

require __DIR__ . "/api/vendor/autoload.php";

use Source\Core\JWTToken;

$jwt = new JWTToken();

var_dump($jwt);

$jwtKey = $jwt->encode([
    "id" => 23,
    "name" => "Santos Silva",
    "email" => "silva@gmail.com"
    ]
);

var_dump($jwtKey);

$jwtObject = $jwt->decode($jwtKey);

var_dump($jwtObject);
