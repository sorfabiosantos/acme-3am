# SE2 — Etapa 06 — JavaScript orientado a objetos

## Objetivo

Refatorar o frontend da Etapa 05 para aplicar POO clássica e POO prototípica,
sem alterar o comportamento do sistema. Demonstre a diferença entre classes
declaradas com `class` e objetos construídos a partir de protótipos.

Crie uma branch chamada `javascript-poo` a partir da versão estável anterior.
Consulte também os exemplos de POO clássica e prototípica em
`C:\Projects\docker-dev-env\public\inf-3am-26\poo-javascript`.

## Parte A — POO clássica com `class`

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

## Parte B — POO prototípica

Implemente pelo menos **duas funcionalidades reutilizáveis** usando
protótipos, sem substituí-las por uma segunda classe `class`. São exemplos:

- objeto `Toast` criado com `Object.create`;
- `FormController` para serializar, validar e limpar formulários;
- `CrudController` para listar, editar e confirmar exclusão;
- adaptador para transformar respostas da API em entidades.

Os métodos compartilhados devem ficar no protótipo, não ser recriados em cada
objeto. Demonstre dois objetos criados a partir do mesmo protótipo e explique
no README o que é compartilhado.

## Toast e tratamento de respostas

Crie um componente reutilizável para as mensagens da API:

| `type` | Aparência |
|---|---|
| `success` | verde |
| `warning` | amarelo |
| `error` | vermelho |

Ele deve aceitar respostas com ou sem `data`, não exibir a `data` inteira
como mensagem e tratar uma resposta inesperada sem silenciar o erro. Use a
grafia `success`.

## Entrega e avaliação

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