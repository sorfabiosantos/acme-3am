# Instruções centrais do Running Power

## Contexto do produto

O Running Power é um micro SaaS em PHP MVC para assessores de corrida de rua,
seus corredores e a administração da plataforma.

As áreas existentes são:

- `index.html`: área pública, autenticação e cadastro de assessores;
- `app/index.html`: área autenticada do assessor;
- `admin/index.html`: painel administrativo acessado diretamente por `/admin`;
- `runner/index.html`: área autenticada do corredor, acessada diretamente por `/runner`.

## Idioma e nomenclatura

- Textos de interface e documentação: Português do Brasil.
- Código, identificadores, classes, métodos e nomes de arquivos: English.
- Preserve a nomenclatura existente em `snake_case` no banco e nos payloads da API.

## Arquitetura

Preserve as fronteiras MVC:

| Camada | Responsabilidade |
|---|---|
| Controller | Rotas, autenticação, validação e respostas JSON |
| Model | SQL, prepared statements e regras de persistência |
| View/assets | Interface, eventos e consumo da API |

Fluxo:

```text
HTML/JavaScript → Apache/API → api/index.php → Controller → Model → MySQL
                                                           ↓
                                                     JSON da API
```

Não coloque SQL em JavaScript, HTML ou controllers. Não coloque regra de
autorização apenas no frontend.

## Frontend

- Use HTML semântico, CSS separado e JavaScript orientado a objetos.
- Não use jQuery nem eventos inline como `onclick`.
- Use `document.querySelector` e listeners registrados em JavaScript.
- Requisições devem reutilizar `views/assets/_common/classes/HttpClientBase.js`.
- Classes de domínio HTTP ficam em `views/assets/_common/classes/`.
- Código específico deve permanecer isolado em `public`, `app`, `admin` ou `runner`.
- Mocks devem ser identificados e não podem substituir silenciosamente uma API integrada.

Pastas atuais:

```text
views/assets/
├── _common/  ← HTTP, classes de domínio, sessão e guards
├── public/   ← landing page e autenticação de assessores
├── app/      ← área do assessor
├── admin/    ← área administrativa
└── runner/   ← área do corredor
```

## Autenticação e autorização

Tipos de acesso usados pelo produto:

- `type_id = 1`: administrador;
- `type_id = 2`: assessor;
- `type_id = 3`: corredor.

As sessões são separadas no `SessionStorage`:

- sessão padrão: assessor;
- escopo `admin`: administrador;
- escopo `runner`: corredor.

Use `AuthGuard` com o escopo e o tipo esperado da área. O backend deve
validar o tipo pelo JWT e derivar o usuário autenticado; nunca confie em um
`user_id` ou `athlete_id` enviado pelo cliente.

Rotas importantes:

```text
POST /users/register
POST /users/login
POST /users/login-athlete
POST /users/login-admin
GET  /athletes/me
PUT  /athletes/me
GET  /workouts/my
GET  /workouts/my/:workoutId
POST /workouts/my/:workoutId/execution
PUT  /workouts/my/:workoutId/execution
GET  /workout-executions/my
GET  /races/my
GET  /progress/my
```

## Banco de dados

O modelo documentado está em `data-base/bd-running-power.md`. A estrutura
atual contempla autenticação, FAQs e o domínio planejado de atletas, grupos,
treinos, execuções, provas e inscrições.

Use prepared statements nos Models e preserve as chaves estrangeiras,
índices e restrições descritos no documento do banco.

## Validação

Não há suíte automatizada configurada. Depois de alterações:

- valide JavaScript com `node --check`;
- valide PHP com `php -l` no container;
- execute `git diff --check`;
- teste as rotas protegidas sem token e com o tipo de usuário correto;
- confirme que as áreas não compartilham sessões indevidamente.
