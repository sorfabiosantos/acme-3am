# Running Power

Micro SaaS para **assessores e treinadores de corrida de rua** organizarem
atletas, treinos, provas e evolução em um único lugar.

## Visão do produto

O Running Power reduz a dependência de planilhas, mensagens e ferramentas
desconectadas. O assessor acompanha sua operação, o corredor consulta sua
programação e registra seus treinos, e o administrador gerencia o conteúdo e a
operação da plataforma.

### Público-alvo

- assessores autônomos de corrida de rua;
- pequenas assessorias esportivas;
- treinadores de atletas iniciantes, intermediários e avançados;
- corredores acompanhados por uma assessoria.

## Áreas implementadas

### Área pública

Entrada: `index.html`

- apresentação do Running Power;
- modal responsiva de autenticação;
- abas **Login**, **Cadastro** e **Esqueci minha senha**;
- cadastro com Nome, E-mail e Senha;
- integração de login e cadastro de assessores com a API;
- recuperação de senha apenas informativa, sem envio de e-mail nesta fase.

### Área do assessor

Entrada: `app/index.html`

- sessão protegida para assessores (`type_id = 2`);
- dashboard responsivo com visão da assessoria;
- métricas de atletas, treinos, aderência e provas;
- agenda de treinos;
- lista de atletas e próximas provas;
- busca de atletas, filtros e interações locais;
- dados de demonstração separados em `mock-data.js`.

### Área administrativa

Entrada: `admin/index.html`, acessada diretamente por `/admin`

- login exclusivo para administradores (`type_id = 1`);
- sessão administrativa separada;
- dashboard operacional com indicadores mockados;
- CRUD de categorias de FAQs;
- CRUD de perguntas frequentes integrado com a API;
- busca por pergunta;
- filtro por categoria;
- ativação e inativação de FAQs;
- exclusão lógica de FAQs e categorias.

Não existe link público para o painel administrativo.

### Área do corredor

Entrada: `runner/index.html`, acessada diretamente por `/runner`

- login exclusivo para corredores (`type_id = 3`);
- sessão própria, separada das sessões de assessor e administrador;
- acesso criado ou enviado pelo assessor, sem cadastro público de corredores;
- dashboard com próximo treino, lembretes e resumo semanal;
- agenda e detalhe de treinos;
- registro de execução e feedback;
- evolução com indicadores e histórico;
- calendário de provas;
- perfil esportivo e vínculo com o assessor.

As telas de treinos, evolução e provas possuem mocks identificados enquanto a
integração completa com os dados de domínio é concluída. O perfil do corredor e
as rotas protegidas iniciais já estão preparados na API.

## Perfis de acesso

| Perfil | Tipo | Área | Responsabilidade |
|---|---:|---|---|
| Administrador | 1 | `/admin` | Operação da plataforma e conteúdo administrativo |
| Assessor | 2 | `/app` | Gerencia atletas, grupos, treinos e provas |
| Corredor | 3 | `/runner` | Consulta treinos, registra execução e acompanha evolução |

## API atual

Autenticação:

```text
POST /users/register
POST /users/login
POST /users/login-athlete
POST /users/login-admin
```

FAQs e categorias:

```text
GET    /faqs
GET    /faqs/admin/list
POST   /faqs
PUT    /faqs/:faqId
DELETE /faqs/:faqId

GET    /faqs-categories
POST   /faqs-categories
PUT    /faqs-categories/:categoryId
DELETE /faqs-categories/:categoryId
```

Área do corredor:

```text
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

As rotas protegidas validam o JWT e o tipo de usuário no backend. O corredor
acessa apenas o próprio perfil, treinos, execuções, provas e indicadores.

## Arquitetura

O projeto utiliza MVC:

```text
Interface → API REST → Controller → Model → MySQL
                                  ↓
                              Resposta JSON
```

| Camada | Responsabilidade |
|---|---|
| `api/source/Controller` | Rotas, autenticação, validação e respostas JSON |
| `api/source/Models` | SQL, prepared statements e regras de persistência |
| `views/assets` | Interface, eventos e consumo da API |
| `data-base` | Documentação e estrutura do banco |

## Estrutura de pastas

```text
acme-3am/
├── .ia/                    ← Instruções, agents e skills oficiais
├── .github/                ← Stubs de compatibilidade para ferramentas
├── api/                    ← API REST em PHP
│   ├── index.php
│   └── source/
│       ├── Config/
│       ├── Controller/
│       ├── Core/
│       └── Models/
├── admin/
│   └── index.html           ← Entrada administrativa
├── app/
│   └── index.html           ← Entrada do assessor
├── runner/
│   └── index.html           ← Entrada do corredor
├── data-base/
│   └── bd-running-power.md  ← DDL do banco do produto
├── index.html               ← Landing page
└── views/assets/
    ├── _common/             ← HTTP, domínio, sessão e guards
    ├── public/              ← Área pública
    ├── app/                 ← Área do assessor
    ├── admin/               ← Painel administrativo
    └── runner/              ← Área do corredor
```

## Banco de dados

Banco utilizado pela aplicação: `db-running-power`.

O DDL está documentado em `data-base/bd-running-power.md`. O modelo contempla:

- `users_types` e `users`;
- `faqs_categories` e `faqs`;
- `athletes`;
- `training_groups` e `athlete_groups`;
- `workouts` e `workout_athletes`;
- `workout_executions`;
- `races` e `athlete_races`.

Os tipos de usuário são `ADMIN`, `TRAINER` e `ATHLETE`, identificados pelos
IDs `1`, `2` e `3`, respectivamente.

O documento contém apenas `CREATE TABLE`, constraints, índices e chaves
estrangeiras; não contém credenciais ou dados de exemplo.

## Tecnologias

- PHP e API REST;
- MVC;
- MySQL;
- Apache;
- HTML semântico;
- CSS;
- JavaScript modular orientado a objetos;
- Composer;
- `HttpClientBase` para requisições HTTP no frontend.

## Status

O projeto está em evolução do MVP. Autenticação, área pública, dashboard do
assessor, painel administrativo, CRUD de FAQs e fundação da área do corredor
já estão implementados.

Próximas evoluções:

- cadastro e convite de corredores pelo assessor;
- integração completa de treinos, execuções, evolução e provas com o banco;
- gestão de grupos e atribuição de treinos;
- recuperação de senha;
- notificações e relatórios reais.
