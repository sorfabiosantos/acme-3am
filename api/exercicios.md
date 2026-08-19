# Exercícios — Web Services


# Trabalho — Etapas de JavaScript

As etapas a seguir devem ser realizadas sobre o sistema desenvolvido pela equipe.
O objetivo não é apenas fazer uma chamada HTTP funcionar, mas demonstrar a
separação entre interface, classes JavaScript, API REST e banco de dados.

## SE2 — Etapa 05 — Integração do backend com o frontend

### Objetivo

Integrar as telas do frontend ao web service da equipe, substituindo dados
estáticos e chamadas improvisadas por requisições assíncronas para a API.
Parte-se do princípio de que as rotas do backend já estão prontas e foram
entregues nas etapas anteriores do trabalho. As regras de negócio, validações,
autenticação, autorização e formatos de resposta já definidos nessas etapas
devem ser respeitados nesta integração.

### Premissas e fonte de consulta

Não é necessário criar ou alterar as rotas nesta etapa. Antes de iniciar o
frontend, consulte a pasta `api/` — especialmente `api/exercicios.md` e os
controllers — para obter informações sobre:

- endpoints, métodos HTTP, parâmetros e corpos das requisições;
- formato das respostas, mensagens e códigos HTTP;
- autenticação, autorização e perfis de acesso;
- comportamento de exclusão lógica, quando aplicável.

As regras definidas nas etapas anteriores continuam sendo a referência
oficial. Se houver divergência entre a tela e a API, adapte o frontend ao
contrato já definido; não crie uma regra paralela no cliente.

### Cadastro e login de usuários

O frontend também deve integrar o fluxo completo de autenticação de usuários:

1. Implemente o cadastro com formulário e `POST` para a rota de registro da
   API. Valide no frontend os campos conforme o contrato já definido. O
   backend continua responsável pela validação final e pelo armazenamento
   seguro da senha; nunca salve ou retorne a senha em texto puro no frontend.
2. Implemente o login com formulário e a rota de autenticação da API. O
   frontend deve enviar as credenciais, interpretar a resposta e informar
   falhas de validação, credenciais inválidas e indisponibilidade do serviço.
3. Após o login, armazene o token e os dados mínimos da sessão de forma
   consistente com o projeto. As requisições protegidas devem enviá-lo no
   cabeçalho HTTP `Authorization`, usando o esquema de autenticação seguido do
   token.
4. Proteja as telas autenticadas no frontend e valide o token, o usuário e suas
   permissões no backend. O frontend não pode ser a única barreira de acesso.
5. Implemente logout, removendo a sessão local, e redirecione o usuário não
   autenticado para a tela de login. Não exponha tokens ou senhas em mensagens,
   logs ou elementos da interface.

O fluxo mínimo a ser demonstrado é:

```text
Cadastro → resposta da API → Login → token → acesso a rota protegida → Logout
```

As rotas de cadastro e login, o formato das credenciais, o formato do token e
os perfis autorizados devem ser documentados junto às demais rotas da etapa.

### Token e `localStorage`

Após um login bem-sucedido, a API retorna o token dentro de `data.token`.
Esse token representa a sessão do usuário; ele não substitui a validação do
backend e não deve ser confundido com a senha. Para esta atividade, armazene o
token no `localStorage` por meio da classe compartilhada
`views/assets/_common/scripts/storage.js`, em vez de espalhar chaves e
chamadas de armazenamento pelos scripts:

```js
saveSession(token, user = null) {
    localStorage.setItem(this.#tokenKey, token);

    if (user) {
        localStorage.setItem(this.#userKey, JSON.stringify(user));
    }
}

getToken() {
    return localStorage.getItem(this.#tokenKey);
}
```

No repositório, `SessionStorage` cria chaves diferentes para cada área. Por
exemplo, o escopo padrão usa `running_power_token` e o escopo `runner` usa
`running_power_runner_token`. Isso evita que as sessões de usuário, corredor e
administrador sobrescrevam umas às outras. O logout deve usar a operação já
disponível na mesma classe:

```js
clearSession() {
    localStorage.removeItem(this.#tokenKey);
    localStorage.removeItem(this.#userKey);
}
```

O exemplo de login em `views/assets/public/scripts/auth-modal.js` obtém o token
da resposta e salva a sessão somente depois de verificar a resposta:

```js
const token = result.data?.token;
if (!token) {
    this.showFeedback("O servidor não retornou uma sessão válida.", "error");
    return;
}

this.storage.saveSession(token, result.data);
```

Nas chamadas protegidas, leia o token do armazenamento e configure o cliente
HTTP. O fluxo usado em `views/assets/runner/scripts/runner-app.js` é:

```js
const token = this.storage.getToken();
this.api.forEach((client) => client.setAuthToken(token));
```

`HttpClientBase` é responsável por transformar esse token no cabeçalho
`Authorization` usando o esquema Bearer. No backend,
`api/source/Controller/Api.php` aceita esse cabeçalho, remove o prefixo do
esquema, decodifica o JWT e verifica o tipo de usuário antes de liberar uma
rota:

```php
$token = $header['Authorization'] ?? $header['authorization'] ?? null;

if (str_starts_with($token, 'Bearer ')) {
    $token = substr($token, 7);
}

$jwtToken = $jwt->decode($token);
```

O frontend pode bloquear a navegação com `AuthGuard`, mas isso é apenas uma
melhoria de experiência. A segurança real acontece no backend, que deve
validar assinatura, expiração, usuário e permissão do token em toda rota
protegida.

`localStorage` é utilizado aqui por ser o padrão didático do projeto e
permanece após o fechamento do navegador. Ele pode ser lido por JavaScript da
origem da aplicação; portanto, nunca armazene senha, dados sensíveis ou o
segredo usado para assinar o JWT. Em uma aplicação de produção, avalie uma
sessão em cookie `HttpOnly`, `Secure` e com política `SameSite` adequada.

Use este formato de resposta:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Operação realizada com sucesso",
  "data": {}
}
```

Em caso de erro, use `type: "error"` e `data: null`. O código deve ser
compatível com o status HTTP: `201` para criação, `400` para dados inválidos,
`401` para ausência de autenticação, `403` para falta de permissão, `404` para
recurso inexistente e `500` para falha interna.

No frontend:

1. Use `async/await`, trate respostas de sucesso e erro e atualize a interface
   sem recarregamento desnecessário.
2. Implemente o CRUD completo da entidade principal e de duas entidades
   relacionadas: cadastro (`POST`), listagem/detalhe (`GET`), edição (`PUT`)
   e exclusão ou inativação confirmada (`DELETE`).
3. Mostre estados de carregamento, lista vazia, sucesso e erro. Não mostre
   sucesso quando a API retornar erro.
4. Não use `onclick`, jQuery ou `fetch` espalhado pelos scripts de tela.
   Registre eventos em JavaScript e mantenha a comunicação HTTP em classes
   reutilizáveis. A refatoração completa para essas classes será exigida na
   Etapa 06.
5. Implemente cadastro, login e logout, exibindo o estado autenticado e
   bloqueando o acesso às telas protegidas quando não houver sessão válida.
6. Entregue evidências e uma tabela com as operações CRUD, autenticação,
   rotas e resultados.

### Critérios de aceite

A etapa estará concluída quando o CRUD puder ser executado pelas telas, o
cadastro e o login criarem uma sessão válida, uma rota protegida exigir
autenticação, o logout encerrar a sessão, os dados permanecerem após atualizar
a página e as respostas `2xx`, `4xx` e `5xx` produzirem mensagens
compreensíveis. Mocks devem ser identificados e não podem substituir
silenciosamente uma rota integrada.

---

## SE2 — Etapa 06 — JavaScript orientado a objetos

### Objetivo

Refatorar o frontend da Etapa 05 para aplicar POO clássica e POO prototípica,
sem alterar o comportamento do sistema. Demonstre a diferença entre classes
declaradas com `class` e objetos construídos a partir de protótipos.

Crie uma branch chamada `javascript-poo` a partir da versão estável anterior.
Consulte também os exemplos de POO clássica e prototípica em
`C:\Projects\docker-dev-env\public\inf-3am-26\poo-javascript`.

### Parte A — POO clássica com `class`

Crie **uma classe JavaScript para cada entidade que o frontend utiliza**, no
mínimo a entidade principal e as duas entidades do CRUD. Cada classe deve ter:

- propriedades privadas ou protegidas quando fizer sentido;
- construtor;
- getters e setters, com validações simples;
- métodos principais da entidade;
- conversão entre payload da API e objeto JavaScript.

Exemplo:

```js
export default class Product {
    #id;
    #name;
    #price;

    constructor({ id = null, name = "", price = 0 } = {}) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value === null ? null : Number(value);
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O nome é obrigatório");
        }
        this.#name = value.trim();
    }

    get price() {
        return this.#price;
    }

    set price(value) {
        const number = Number(value);
        if (!Number.isFinite(number) || number < 0) {
            throw new RangeError("O preço deve ser um número não negativo");
        }
        this.#price = number;
    }

    toJSON() {
        return { id: this.id, name: this.name, price: this.price };
    }
}
```

Crie também classes de serviço HTTP que estendam:

```text
views/assets/_common/classes/HttpClientBase.js
```

Reaproveite os métodos `get`, `post`, `put` e `delete`, a URL base, os
cabeçalhos e a autenticação. Uma classe como `ProductService` deve expor
`list`, `find`, `create`, `update` e `remove`. Os scripts de tela chamam o
serviço; não chamam `fetch` diretamente. O serviço não deve manipular HTML.

Crie ou adapte uma classe de usuários para cadastro, login e atualização de
perfil usando as rotas reais. O método do login deve corresponder ao backend;
não presuma que login seja `GET`.

### Parte B — POO prototípica

Implemente pelo menos **duas funcionalidades reutilizáveis** usando
protótipos, sem substituí-las por uma segunda classe `class`. São exemplos:

- objeto `Toast` criado com `Object.create`;
- `FormController` para serializar, validar e limpar formulários;
- `CrudController` para listar, editar e confirmar exclusão;
- adaptador para transformar respostas da API em entidades.

Os métodos compartilhados devem ficar no protótipo, não ser recriados em cada
objeto. Demonstre dois objetos criados a partir do mesmo protótipo e explique
no README o que é compartilhado.

### Toast e tratamento de respostas

Crie um componente reutilizável para as mensagens da API:

| `type` | Aparência |
|---|---|
| `success` | verde |
| `warning` | amarelo |
| `error` | vermelho |

Ele deve aceitar respostas com ou sem `data`, não exibir a `data` inteira
como mensagem e tratar uma resposta inesperada sem silenciar o erro. Use a
grafia `success`.

### Entrega e avaliação

Entregue a branch `javascript-poo` com:

- uma classe de entidade para cada entidade usada;
- construtor, getters, setters e métodos principais;
- serviços HTTP derivados de `HttpClientBase`;
- CRUD da entidade principal e de duas entidades integrado às rotas reais;
- duas funcionalidades baseadas em protótipos;
- toast e estados de carregamento, sucesso e erro;
- README com arquitetura e instruções de execução;
- evidências do CRUD e explicação de encapsulamento, herança, composição e
  protótipos.

Será avaliado o funcionamento integrado, a separação de responsabilidades, a
reutilização dos protótipos e serviços, a validação, a clareza e a
correspondência entre frontend, backend e banco. Não basta criar classes sem
utilizá-las nas telas.
## Padrão de Retorno da API

Todos os endpoints deste sistema devem seguir o padrão de resposta JSON abaixo:

| Código | `type`    | `status`               | Significado                                                    |
|--------|-----------|------------------------|----------------------------------------------------------------|
| 200    | `success` | `success`              | Requisição bem-sucedida, com ou sem dados de retorno.          |
| 201    | `success` | `created`              | Recurso criado com sucesso (usado em POST).                    |
| 400    | `error`   | `bad_request`          | Dados enviados pelo cliente são inválidos ou incompletos.      |
| 401    | `error`   | `unauthorized`         | Usuário não está autenticado (sem token ou token inválido).    |
| 403    | `error`   | `forbidden`            | Usuário autenticado, mas sem permissão para este recurso.      |
| 404    | `error`   | `not_found`            | O recurso solicitado não existe.                               |
| 500    | `error`   | `internal_server_error`| Erro inesperado no servidor.                                   |

---

## Exercício 01 — Listando todos os produtos

### Contextualizando

Você está desenvolvendo a API de um sistema de gerenciamento de estoque. O frontend precisa exibir uma tabela com todos os produtos cadastrados, incluindo o nome da categoria de cada um. Como os dados vêm de tabelas diferentes (`products` e `products_categories`), o backend precisa fazer um `JOIN` e retornar tudo em um único endpoint.

### Objetivo

Criar um endpoint que retorne a lista completa de produtos com suas respectivas categorias.

### Enunciado

Implemente o endpoint `GET /products/list` no controller `Products` e no model `Product`.

O retorno deve seguir este padrão:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Lista de Produtos",
  "data": [
    {
      "id": 1,
      "name": "Mouse Logitech M170",
      "price": "89.90",
      "category_name": "Periféricos"
    },
    {
      "id": 2,
      "name": "Teclado Logitech K120",
      "price": "79.90",
      "category_name": "Periféricos"
    }
  ]
}
```

> 💡 **Dica:** Use `JOIN` entre `products` e `products_categories` para obter o `category_name` sem precisar de uma segunda consulta.

---

## Exercício 02 — Buscando um produto pelo ID

### Contextualizando

Com o endpoint de listagem funcionando, o próximo passo natural é permitir que o frontend busque os detalhes de **um produto específico** — por exemplo, ao clicar em um item da tabela.

### Objetivo

Criar um endpoint que receba um `id` via URL, valide o parâmetro, consulte o banco e retorne o produto encontrado — ou uma mensagem de erro adequada caso o `id` seja inválido ou o produto não exista.

### Enunciado

Implemente o endpoint `GET /products/list/{productId}`.

Trate os seguintes cenários:

**✅ Produto encontrado — `200 OK`**
```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Produto encontrado",
  "data": {
    "id": 1,
    "name": "Mouse Logitech M170",
    "price": "89.90",
    "category_name": "Periféricos"
  }
}
```

**⚠️ ID inválido (não é número inteiro) — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "ID do produto é obrigatório e deve ser um número inteiro",
  "data": null
}
```

**❌ Produto não existe no banco — `404 Not Found`**
```json
{
  "code": 404,
  "type": "error",
  "status": "not_found",
  "message": "Produto não encontrado",
  "data": null
}
```

> 💡 **Dica:** Valide o parâmetro `{productId}` antes de consultar o banco. Use `filter_var($id, FILTER_VALIDATE_INT)` para verificar se é um inteiro válido.

---

## Exercício 03 — Buscando uma categoria de produto pelo ID

### Contextualizando

Com o endpoint de listagem de categorias funcionando, o próximo passo natural é permitir que o frontend busque os detalhes de **uma categoria de produto específica** — por exemplo, ao clicar em um item da tabela.

### Objetivo

Criar um endpoint que receba um `id` via URL, valide o parâmetro, consulte o banco e retorne a categoria de produto encontrada — ou uma mensagem de erro adequada caso o `id` seja inválido ou a vategoria não exista.

### Enunciado

Implemente o endpoint `GET /categories-products/list/{categoryId}`.

Trate os seguintes cenários:

**✅ Produto encontrado — `200 OK`**
```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Categoria encontrada",
  "data": {
    "id": 1,
    "name": "Periféricos"
  }
}
```

**⚠️ ID inválido (não é número inteiro) — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "ID da categoria do produto é obrigatório e deve ser um número inteiro",
  "data": null
}
```

**❌ Categoria de Produto não existe no banco — `404 Not Found`**
```json
{
  "code": 404,
  "type": "error",
  "status": "not_found",
  "message": "Categoria não encontrada",
  "data": null
}
```

> 💡 **Dica:** Valide o parâmetro `{categpryId}` antes de consultar o banco. Use `filter_var($id, FILTER_VALIDATE_INT)` para verificar se é um inteiro válido.

---

## Exercício 04 — Inserindo um novo produto

### Contextualizando

O painel administrativo precisa de uma tela para cadastrar novos produtos. O formulário envia `name`, `price` e `category_id` para a API, que valida os dados e insere o registro no banco. O frontend espera receber de volta o produto recém-criado para confirmar o sucesso ao usuário.

### Objetivo

Criar um endpoint que receba os dados de um produto via `POST`, valide os campos obrigatórios, insira o registro no banco e retorne o produto criado.

### Enunciado

Implemente o endpoint `POST /products`.

O corpo da requisição (`body`) será um JSON com:
```json
{
  "name": "Headset HyperX Cloud II",
  "price": 349.90,
  "category_id": 2
}
```

Trate os seguintes cenários:

**✅ Produto criado com sucesso — `201 Created`**
```json
{
  "code": 201,
  "type": "success",
  "status": "created",
  "message": "Produto criado com sucesso",
  "data": {
    "id": 26,
    "name": "Headset HyperX Cloud II",
    "price": "349.90",
    "category_name": "Periféricos"
  }
}
```

**⚠️ Campos obrigatórios ausentes ou inválidos — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "Os campos name, price e category_id são obrigatórios",
  "data": null
}
```

**❌ Erro inesperado ao salvar — `500 Internal Server Error`**
```json
{
  "code": 500,
  "type": "error",
  "status": "internal_server_error",
  "message": "Não foi possível cadastrar o produto",
  "data": null
}
```

> 💡 **Dica:** Leia o corpo da requisição com `file_get_contents("php://input")` e decodifique com `json_decode()`. Verifique se todos os campos obrigatórios estão presentes antes de chamar o model. O 500 deve ser retornado quando o `INSERT` falhar por motivo interno (ex: FK inválida, banco indisponível).

---

## Exercício 04.1 — Inserindo uma nova categoria de produto

### Contextualizando

O painel administrativo precisa de uma tela para cadastrar novas categorias de produtos. O formulário envia apenas o `name` da categoria para a API, que valida o dado e insere o registro no banco. O frontend espera receber de volta a nova categoria de produto recém-criada para confirmar o sucesso ao usuário.

### Objetivo

Criar um endpoint que receba o nome da categoria do produto via `POST`, valide o campo obrigatório, insira o registro no banco e retorne a categoria do produto criada.

### Enunciado

Implemente o endpoint `POST /categories-products`.

O corpo da requisição (`body`) será um JSON com:
```json
{
  "name": "Nova Categoria"
}
```

Trate os seguintes cenários:

**✅ Produto criado com sucesso — `201 Created`**
```json
{
  "code": 201,
  "type": "success",
  "status": "created",
  "message": "Categoria de Produto criada com sucesso",
  "data": {
    "id": 26,
    "name": "Nova Categoria"
  }
}
```

**⚠️ Campo obrigatório ausente ou inválido — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "O campo nome é obrigatório",
  "data": null
}
```

**❌ Erro inesperado ao salvar — `500 Internal Server Error`**
```json
{
  "code": 500,
  "type": "error",
  "status": "internal_server_error",
  "message": "Não foi possível cadastrar o produto",
  "data": null
}
```
---

## Exercício 05 — Atualizando um produto

### Contextualizando

Na tela de edição do painel administrativo, o usuário altera os dados de um produto já existente e clica em "Salvar". O frontend envia os novos valores para a API, que valida o `id`, verifica se o produto existe e aplica as alterações no banco.

### Objetivo

Criar um endpoint que receba o `id` do produto via URL e os novos dados via `body`, valide tudo e execute o `UPDATE` — retornando o produto atualizado.

### Enunciado

Implemente o endpoint `PUT /products/{productId}`.

O corpo da requisição seguirá o mesmo formato do `POST`:
```json
{
  "name": "Headset HyperX Cloud II Wireless",
  "price": 499.90,
  "category_id": 2
}
```

Trate os seguintes cenários:

**✅ Produto atualizado com sucesso — `200 OK`**
```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Produto atualizado com sucesso",
  "data": {
    "id": 26,
    "name": "Headset HyperX Cloud II Wireless",
    "price": "499.90",
    "category_name": "Periféricos"
  }
}
```

**⚠️ ID inválido ou campos ausentes — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "ID inválido ou campos obrigatórios ausentes",
  "data": null
}
```

**❌ Produto não encontrado — `404 Not Found`**
```json
{
  "code": 404,
  "type": "error",
  "status": "not_found",
  "message": "Produto não encontrado",
  "data": null
}
```

> 💡 **Dica:** Antes de executar o `UPDATE`, faça um `SELECT` para confirmar que o produto existe — e use o mesmo retorno 404 do Exercício 02. Você pode reaproveitar o método de busca por ID que já implementou.

---

## Exercício 06 — Removendo um produto (soft delete)

### Contextualizando

No mundo real, **excluir registros definitivamente do banco é uma má prática**: perde-se histórico, pode-se quebrar integridade referencial e não há como recuperar o dado. A solução adotada neste sistema é o **soft delete** — em vez de deletar o registro, ele é marcado como inativo com um campo `active`.

### Objetivo

Criar um endpoint de exclusão que **não apague o registro**, mas altere seu campo `active` para `0`, tornando-o invisível nas listagens sem removê-lo do banco.

### Enunciado

**Passo 1 — Altere a tabela no banco** e atualize o `dump.slq`:
```sql
ALTER TABLE `products` ADD COLUMN `active` tinyint(1) NOT NULL DEFAULT 1;
```

**Passo 2 — Atualize as queries existentes:**
Os endpoints `GET /products/list` e `GET /products/list/{id}` devem passar a filtrar apenas produtos com `active = 1`.

**Passo 3 — Implemente o endpoint `DELETE /products/{productId}`:**

Trate os seguintes cenários:

**✅ Produto desativado com sucesso — `200 OK`**
```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Produto removido com sucesso",
  "data": null
}
```

**⚠️ ID inválido — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "ID do produto é obrigatório e deve ser um número inteiro",
  "data": null
}
```

**❌ Produto não encontrado ou já inativo — `404 Not Found`**
```json
{
  "code": 404,
  "type": "error",
  "status": "not_found",
  "message": "Produto não encontrado",
  "data": null
}
```

> 💡 **Dica:** A query do soft delete é um simples `UPDATE`: `UPDATE products SET active = 0 WHERE id = :id AND active = 1`. Se `rowCount()` retornar `0`, o produto não existe ou já estava inativo — retorne `404`.

---

## Exercício 07 — Listando todas as categorias de FAQ

Para essa atividade crie as seguintes namespaces: `App\Controller\Faqs` e `App\Models\Faqs`.

### Contextualizando

Você vai iniciar o desenvolvimento do módulo de **Perguntas Frequentes (FAQ)** do sistema. Antes de trabalhar com as perguntas em si, é necessário listar as categorias disponíveis — pois toda pergunta pertence a uma categoria. O frontend usará essa listagem para exibir um menu de filtros ou popular um `<select>` no formulário de cadastro.

### Objetivo

Criar um endpoint que retorne a lista completa de categorias de FAQ.

### Enunciado

Implemente o endpoint `GET /faqs-categories/list` no controller `FaqsCategories` e no model `FaqCategory`.

O retorno deve seguir este padrão:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Lista de Categorias de FAQ",
  "data": [
    { "id": 1, "name": "Pagamentos" },
    { "id": 2, "name": "Entregas" }
  ]
}
```

> 💡 **Dica:** Sem `JOIN` necessário aqui — `faqs_categories` é uma tabela simples. Use `fetchAll(PDO::FETCH_ASSOC)` e retorne o array direto em `data`.

---

## Exercício 08 — Buscando uma categoria de FAQ pelo ID

### Contextualizando

Com a listagem de categorias funcionando, o painel administrativo precisa exibir os dados de **uma categoria específica** ao abrir o formulário de edição. O frontend envia o `id` da categoria via URL e espera receber seus dados — ou um erro caso o `id` seja inválido ou a categoria não exista.

### Objetivo

Criar um endpoint que receba um `id` via URL, valide o parâmetro, consulte o banco e retorne a categoria encontrada — ou a mensagem de erro adequada.

### Enunciado

Implemente o endpoint `GET /faqs-categories/list/{categoryId}`.

Trate os seguintes cenários:

**✅ Categoria encontrada — `200 OK`**
```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Categoria encontrada",
  "data": { "id": 1, "name": "Pagamentos" }
}
```

**⚠️ ID inválido (não é número inteiro) — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "ID da categoria é obrigatório e deve ser um número inteiro",
  "data": null
}
```

**❌ Categoria não existe no banco — `404 Not Found`**
```json
{
  "code": 404,
  "type": "error",
  "status": "not_found",
  "message": "Categoria não encontrada",
  "data": null
}
```

> 💡 **Dica:** Use `filter_var($id, FILTER_VALIDATE_INT)` para validar o parâmetro. Use `fetch(PDO::FETCH_ASSOC)` e verifique se o retorno é `false` para identificar o 404.

---

## Exercício 09 — Listando todas as perguntas do FAQ

### Contextualizando

A página pública do FAQ precisa exibir todas as perguntas cadastradas agrupadas por categoria. Para isso, o backend deve retornar cada pergunta já com o nome da sua categoria — evitando que o frontend precise fazer múltiplas requisições.

### Objetivo

Criar um endpoint que retorne a lista completa de perguntas do FAQ, incluindo o nome da categoria de cada uma via `JOIN`.

### Enunciado

Implemente o endpoint `GET /faqs/list` no controller `Faqs` e no model `Faq`.

O retorno deve seguir este padrão:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Lista de FAQs",
  "data": [
    {
      "id": 1,
      "question": "Como faço para rastrear meu pedido?",
      "answer": "Acesse a área 'Meus Pedidos' e clique em 'Rastrear'.",
      "category_name": "Entregas"
    },
    {
      "id": 2,
      "question": "Quais formas de pagamento são aceitas?",
      "answer": "Aceitamos cartão de crédito, boleto e Pix.",
      "category_name": "Pagamentos"
    }
  ]
}
```

> 💡 **Dica:** Use `JOIN` entre `faqs` e `faqs_categories` para trazer o `category_name`. A estrutura é idêntica ao `JOIN` que você fez com `products` — apenas os nomes de tabela e campos mudam.

---

## Exercício 10 — Buscando uma pergunta do FAQ pelo ID

### Contextualizando

Ao clicar em uma pergunta na listagem, o frontend pode precisar exibir sua página de detalhe ou abrir o formulário de edição no painel admin. O endpoint deve retornar os dados completos da pergunta — incluindo a categoria — com tratamento adequado para `id` inválido ou pergunta inexistente.

### Objetivo

Criar um endpoint que receba o `id` de uma pergunta via URL e retorne seus dados completos, com validação e tratamento de erros.

### Enunciado

Implemente o endpoint `GET /faqs/list/{faqId}`.

Trate os seguintes cenários:

**✅ Pergunta encontrada — `200 OK`**
```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "FAQ encontrado",
  "data": {
    "id": 1,
    "question": "Como faço para rastrear meu pedido?",
    "answer": "Acesse a área 'Meus Pedidos' e clique em 'Rastrear'.",
    "category_name": "Entregas"
  }
}
```

**⚠️ ID inválido (não é número inteiro) — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "ID do FAQ é obrigatório e deve ser um número inteiro",
  "data": null
}
```

**❌ Pergunta não existe no banco — `404 Not Found`**
```json
{
  "code": 404,
  "type": "error",
  "status": "not_found",
  "message": "FAQ não encontrado",
  "data": null
}
```

> 💡 **Dica:** Reaproveite a mesma query com `JOIN` do Exercício 09 — apenas adicione `WHERE faqs.id = :id`.

---

## Exercício 11 — Inserindo uma nova categoria de FAQ

### Contextualizando

O painel administrativo precisa de um formulário para criar novas categorias de FAQ. O formulário envia apenas o `name` da categoria. A API deve validar o campo, inserir o registro no banco e retornar a categoria criada.

### Objetivo

Criar um endpoint `POST` que receba o nome da categoria, valide, insira e retorne o registro criado.

### Enunciado

Implemente o endpoint `POST /faqs-categories`.

O corpo da requisição (`body`) será um JSON com:
```json
{
  "name": "Devoluções"
}
```

Trate os seguintes cenários:

**✅ Categoria criada com sucesso — `201 Created`**
```json
{
  "code": 201,
  "type": "success",
  "status": "created",
  "message": "Categoria de FAQ criada com sucesso",
  "data": { "id": 6, "name": "Devoluções" }
}
```

**⚠️ Campo obrigatório ausente — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "O campo name é obrigatório",
  "data": null
}
```

**❌ Erro inesperado ao salvar — `500 Internal Server Error`**
```json
{
  "code": 500,
  "type": "error",
  "status": "internal_server_error",
  "message": "Não foi possível cadastrar a categoria",
  "data": null
}
```

> 💡 **Dica:** Após o `INSERT`, use `lastInsertId()` para retornar o `id` gerado. Verifique se `name` não está vazio com `empty(trim($name))`.

---

## Exercício 12 — Inserindo uma nova pergunta no FAQ

### Contextualizando

O painel administrativo precisa de um formulário para adicionar novas perguntas ao FAQ. O formulário envia `question`, `answer` e `faqs_category_id`. A API valida os dados, insere o registro vinculado à categoria e retorna a pergunta criada com o nome da categoria.

### Objetivo

Criar um endpoint `POST` que receba os dados de uma pergunta, valide os campos obrigatórios, insira no banco e retorne o FAQ criado.

### Enunciado

Implemente o endpoint `POST /faqs`.

O corpo da requisição (`body`) será um JSON com:
```json
{
  "question": "Como cancelo um pedido?",
  "answer": "Acesse 'Meus Pedidos', selecione o pedido e clique em 'Cancelar'.",
  "faqs_category_id": 1
}
```

Trate os seguintes cenários:

**✅ Pergunta criada com sucesso — `201 Created`**
```json
{
  "code": 201,
  "type": "success",
  "status": "created",
  "message": "FAQ criado com sucesso",
  "data": {
    "id": 16,
    "question": "Como cancelo um pedido?",
    "answer": "Acesse 'Meus Pedidos', selecione o pedido e clique em 'Cancelar'.",
    "category_name": "Pedidos"
  }
}
```

**⚠️ Campos obrigatórios ausentes ou inválidos — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "Os campos question, answer e faqs_category_id são obrigatórios",
  "data": null
}
```

**❌ Erro inesperado ao salvar — `500 Internal Server Error`**
```json
{
  "code": 500,
  "type": "error",
  "status": "internal_server_error",
  "message": "Não foi possível cadastrar o FAQ",
  "data": null
}
```

> 💡 **Dica:** Após o `INSERT`, use `lastInsertId()` para obter o `id` e então faça um `SELECT` com `JOIN` para retornar o `category_name` na resposta — assim como no Exercício 10.

---

## Exercício 13 — Atualizando uma pergunta do FAQ

### Contextualizando

Ao editar uma pergunta no painel administrativo, o frontend envia os dados atualizados via `PUT`. A API precisa validar o `id` via URL, verificar se a pergunta existe, aplicar as alterações e retornar os dados atualizados.

### Objetivo

Criar um endpoint `PUT` que receba o `id` do FAQ via URL e os novos dados via `body`, valide, execute o `UPDATE` e retorne a pergunta atualizada.

### Enunciado

Implemente o endpoint `PUT /faqs/{faqId}`.

O corpo da requisição seguirá o mesmo formato do `POST`:
```json
{
  "question": "Como cancelo um pedido após a confirmação?",
  "answer": "Pedidos confirmados só podem ser cancelados em até 1 hora.",
  "faqs_category_id": 1
}
```

Trate os seguintes cenários:

**✅ FAQ atualizado com sucesso — `200 OK`**
```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "FAQ atualizado com sucesso",
  "data": {
    "id": 16,
    "question": "Como cancelo um pedido após a confirmação?",
    "answer": "Pedidos confirmados só podem ser cancelados em até 1 hora.",
    "category_name": "Pedidos"
  }
}
```

**⚠️ ID inválido ou campos ausentes — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "ID inválido ou campos obrigatórios ausentes",
  "data": null
}
```

**❌ FAQ não encontrado — `404 Not Found`**
```json
{
  "code": 404,
  "type": "error",
  "status": "not_found",
  "message": "FAQ não encontrado",
  "data": null
}
```

> 💡 **Dica:** Antes do `UPDATE`, faça um `SELECT` para confirmar que o FAQ existe — reaproveite o método de busca por ID do Exercício 10. Após atualizar, faça outro `SELECT` com `JOIN` para retornar os dados completos na resposta.

---

## Exercício 14 — Atualizando uma categoria de FAQ

### Contextualizando

Categorias criadas por engano ou com nome incorreto precisam ser corrigidas sem serem excluídas — pois já podem ter perguntas vinculadas a elas. O endpoint recebe o `id` via URL e o novo nome via `body`.

### Objetivo

Criar um endpoint `PUT` de atualização de categoria de FAQ, com validação do `id` e do campo `name`.

### Enunciado

Implemente o endpoint `PUT /faqs-categories/{categoryId}`.

O corpo da requisição será:
```json
{
  "name": "Pagamentos e Cobranças"
}
```

Trate os seguintes cenários:

**✅ Categoria atualizada com sucesso — `200 OK`**
```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Categoria atualizada com sucesso",
  "data": { "id": 1, "name": "Pagamentos e Cobranças" }
}
```

**⚠️ ID inválido ou campo ausente — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "ID inválido ou campo name é obrigatório",
  "data": null
}
```

**❌ Categoria não encontrada — `404 Not Found`**
```json
{
  "code": 404,
  "type": "error",
  "status": "not_found",
  "message": "Categoria não encontrada",
  "data": null
}
```

> 💡 **Dica:** Confirme a existência da categoria antes do `UPDATE` — reaproveite o método de busca por ID do Exercício 08.

---

## Exercício 15 — Removendo uma pergunta do FAQ (soft delete)

### Contextualizando

Perguntas do FAQ podem se tornar obsoletas sem que precisem ser apagadas definitivamente — elas podem ser reativadas no futuro ou consultadas por auditoria. Assim como no Exercício 06 com produtos, a exclusão aqui será um **soft delete**: o registro permanece no banco, mas fica invisível para as listagens públicas.

### Objetivo

Adicionar a coluna `active` à tabela `faqs`, atualizar as listagens para filtrar apenas registros ativos e criar o endpoint de exclusão lógica.

### Enunciado

**Passo 1 — Altere a tabela no banco** e atualize o `dump.slq`:
```sql
ALTER TABLE `faqs` ADD COLUMN `active` tinyint(1) NOT NULL DEFAULT 1;
```

**Passo 2 — Atualize as queries existentes:**
Os endpoints `GET /faqs/list` e `GET /faqs/list/{id}` devem passar a filtrar apenas FAQs com `active = 1`.

**Passo 3 — Implemente o endpoint `DELETE /faqs/{faqId}`:**

Trate os seguintes cenários:

**✅ FAQ desativado com sucesso — `200 OK`**
```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "FAQ removido com sucesso",
  "data": null
}
```

**⚠️ ID inválido — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "ID do FAQ é obrigatório e deve ser um número inteiro",
  "data": null
}
```

**❌ FAQ não encontrado ou já inativo — `404 Not Found`**
```json
{
  "code": 404,
  "type": "error",
  "status": "not_found",
  "message": "FAQ não encontrado",
  "data": null
}
```

> 💡 **Dica:** Query do soft delete: `UPDATE faqs SET active = 0 WHERE id = :id AND active = 1`. Se `rowCount()` retornar `0`, o FAQ não existe ou já estava inativo — retorne `404`.

---

## Exercício 16 — Removendo uma categoria de FAQ (soft delete)

### Contextualizando

Antes de inativar uma categoria, é importante considerar que ela pode ter perguntas vinculadas. Neste exercício, o soft delete será aplicado à tabela `faqs_categories`. Como medida de segurança, o endpoint deve recusar a exclusão caso a categoria ainda possua FAQs ativos — evitando que perguntas fiquem sem categoria visível.

### Objetivo

Adicionar a coluna `active` à tabela `faqs_categories` e criar o endpoint de soft delete com uma verificação de integridade: não permitir inativar uma categoria que ainda possui FAQs ativos.

### Enunciado

**Passo 1 — Altere a tabela no banco** e atualize o `dump.slq`:
```sql
ALTER TABLE `faqs_categories` ADD COLUMN `active` tinyint(1) NOT NULL DEFAULT 1;
```

**Passo 2 — Atualize as queries existentes:**
Os endpoints `GET /faqs-categories/list` e `GET /faqs-categories/list/{id}` devem filtrar apenas categorias com `active = 1`.

**Passo 3 — Implemente o endpoint `DELETE /faqs-categories/{categoryId}`:**

Trate os seguintes cenários:

**✅ Categoria desativada com sucesso — `200 OK`**
```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Categoria removida com sucesso",
  "data": null
}
```

**⚠️ ID inválido — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "ID da categoria é obrigatório e deve ser um número inteiro",
  "data": null
}
```

**🚫 Categoria possui FAQs ativos — `400 Bad Request`**
```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "Não é possível remover uma categoria que possui FAQs ativos",
  "data": null
}
```

**❌ Categoria não encontrada ou já inativa — `404 Not Found`**
```json
{
  "code": 404,
  "type": "error",
  "status": "not_found",
  "message": "Categoria não encontrada",
  "data": null
}
```

> 💡 **Dica:** Antes do soft delete, faça um `SELECT COUNT(*) FROM faqs WHERE faqs_category_id = :id AND active = 1`. Se o resultado for maior que `0`, retorne `400` com a mensagem de bloqueio. Só execute o `UPDATE` se a categoria estiver vazia de FAQs ativos.

---