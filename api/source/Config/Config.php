<?php

const CONF_URL_BASE = "http://localhost:8080/acme-3am"; // URL base do site, geralmente localhost em desenvolvimento
const CONF_URL_TEST = "http://localhost:8080/acme-3am"; // URL base do site, geralmente localhost em desenvolvimento


const CONF_DB_HOST = "mysql";
const CONF_DB_NAME = "db-acme-manha";
const CONF_DB_USER= "root";
const CONF_DB_PORT = 3306;
const CONF_DB_PASS= "1234567";

// Chave secreta para criação do token JWT, deve ser uma string complexa e única para cada aplicação
// para gerar a sua acesse: https://jwtsecrets.com/
const JWT_SECRET_KEY = "e17851db9fee8e49f728550fc2f82111c4374f426c9cadda9403390ef638073ff21fd7a7e35d025861e175b0fb93609d838fba3185c859c13b9f43cf92ecbd48";