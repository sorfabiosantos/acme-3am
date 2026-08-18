# Agent de Frontend Design

## Objetivo

Planejar e implementar interfaces do Running Power sem misturar as áreas
pública, assessor, administrador e corredor.

## Regras permanentes

- Textos e documentação em Português do Brasil.
- Código, identificadores, classes, métodos e arquivos em English.
- HTML semântico e CSS em arquivo separado.
- Não usar jQuery nem eventos inline.
- Usar `document.querySelector` e listeners em JavaScript.
- Integrar API por classes que herdam de `HttpClientBase`.
- Não colocar regra de negócio ou autorização somente na View.

## Áreas da aplicação

### Área pública

- Entrada: `index.html`.
- Público: visitantes e assessores ainda não autenticados.
- Objetivo: apresentar o produto, permitir login e cadastro de assessores.
- A modal possui as abas Login, Cadastro e Esqueci minha senha.
- A recuperação de senha permanece informativa, sem envio de e-mail.

### Área do assessor

- Entrada: `app/index.html`.
- Público: usuários autenticados com `type_id = 2`.
- Navegação: Dashboard, Meus atletas, Treinos, Provas, Relatórios e
  Configurações.
- O dashboard atual usa dados mockados enquanto os módulos de domínio são
  conectados ao backend.

### Área administrativa

- Entrada: `admin/index.html`, acessada diretamente por `/admin`.
- Público: usuários `type_id = 1`.
- Possui dashboard operacional mockado.
- Possui CRUD integrado de FAQs e categorias.
- A lista de FAQs possui busca por pergunta, filtro por categoria e controle
  de ativação/inativação.
- Não adicionar link público para o painel administrativo.

### Área do corredor

- Entrada: `runner/index.html`, acessada diretamente por `/runner`.
- Público: usuários `type_id = 3` cadastrados pelo assessor.
- Possui sessão própria e login em `POST /users/login-athlete`.
- Navegação: Início, Treinos, Evolução, Provas, Perfil e Sair.
- O foco visual é o próximo treino e as ações do dia.
- O MVP apresenta dashboard, detalhe de treino, registro de execução/feedback,
  indicadores de evolução, provas vinculadas e perfil esportivo.
- Treinos, evolução e provas devem mostrar estados de mock, carregamento, erro e
  vazio enquanto a integração não estiver concluída.
- O corredor não edita a prescrição nem consulta dados de outros corredores.

## Organização de arquivos

```text
views/assets/
├── _common/
│   ├── classes/     ← HttpClientBase e classes de domínio
│   └── scripts/     ← storage e AuthGuard
├── public/
│   ├── scripts/
│   └── styles/
├── app/
│   ├── scripts/
│   └── styles/
├── admin/
│   ├── scripts/
│   └── styles/
└── runner/
    ├── scripts/
    └── styles/
```

## Direção visual

- Manter a identidade Running Power com laranja como ação, azul-marinho para
  estrutura e verde para sucesso.
- O assessor precisa de visão operacional rápida.
- O administrador precisa de tabelas, filtros, feedback e indicadores.
- O corredor precisa de simplicidade, leitura mobile-first, destaque para o
  próximo treino e confirmação clara de execução.
- Todos os fluxos devem possuir estados de carregamento, vazio, erro e sucesso.
