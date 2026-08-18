# Contexto geral dos agentes

## Produto

O Running Power é um micro SaaS para assessores de corrida de rua. O produto
organiza atletas, treinos, provas, feedbacks e evolução, com um painel
administrativo para a operação da plataforma.

## Estado atual

- A landing page possui modal de Login, Cadastro e recuperação informativa.
- O cadastro público cria assessores (`type_id = 2`).
- O assessor possui dashboard em `app/` com métricas, agenda, atletas e provas
  mockadas.
- O painel `/admin` possui login administrativo, dashboard mockado e CRUD de
  FAQs/categorias integrado à API.
- FAQs podem ser filtradas por nome e categoria e ativadas/inativadas.
- A área `/runner` possui login próprio (`type_id = 3`), sessão separada,
  dashboard, treinos, registro de execução/feedback, evolução, provas e perfil.
- A interface do corredor ainda usa mocks em partes do domínio; os endpoints
  protegidos e os Models iniciais estão preparados para a integração gradual.
- O modelo SQL está documentado em `data-base/bd-running-power.md`.

## Perfis e sessões

| Perfil | Tipo | Entrada | Escopo de sessão |
|---|---:|---|---|
| Administrador | 1 | `/admin` | `admin` |
| Assessor | 2 | `/app` | padrão |
| Corredor | 3 | `/runner` | `runner` |

O corredor é criado/convidado pelo assessor; não existe cadastro público de
corredores nesta fase.

## Arquitetura a preservar

- `api/`: backend PHP que responde JSON.
- `api/index.php`: front controller e definição das rotas.
- `api/source/Controller/`: autenticação, validação e orquestração.
- `api/source/Models/`: SQL e regras de persistência.
- `views/assets/_common/`: classes HTTP, domínio, storage e guards.
- `views/assets/public/`: landing page e autenticação de assessores.
- `views/assets/app/`: área do assessor.
- `views/assets/admin/`: painel administrativo.
- `views/assets/runner/`: área do corredor.

Controllers não devem conter SQL. Models devem usar prepared statements.
Views não devem acessar o banco diretamente nem decidir permissões.

## Convenções de frontend

- Documentação e textos em Português do Brasil.
- Código, classes, métodos e arquivos em English.
- HTML semântico, CSS separado e listeners em JavaScript.
- Sem jQuery ou eventos inline.
- Usar `HttpClientBase` em todas as chamadas de API.
- Manter mocks claramente identificados e separados dos clientes HTTP.

## Próximas evoluções prováveis

- Cadastro e convite de corredores pelo assessor.
- Integração dos treinos, execuções, evolução e provas com o banco.
- Gestão de grupos e atribuição de treinos.
- Recuperação de senha e notificações.
- Relatórios reais para assessores e administração.
