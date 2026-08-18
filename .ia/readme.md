# 🤖 `.ia/` — A "central de instruções" para IAs do projeto

> 📖 **Leia este arquivo primeiro** — ele explica **como** e **por que** usar agents e skills.  
> 🎯 **Público:** Todos os estudantes da disciplina (qualquer ferramenta de IA)

---

## 🧭 Visão Geral

Imagine que você está ensinando um **estagiário novo** a trabalhar no projeto. Você daria a ele um documento dizendo:

- Como o projeto funciona
- Quais regras seguir
- Onde cada arquivo deve ir

**Agents e skills são exatamente isso, mas para IAs.**

| O que é | Analogia | Exemplo |
|---|---|---|
| **Agent** | 📋 O **"o quê"** — contexto, planejamento, decisões | "Quais telas o sistema precisa ter?" |
| **Skill** | 🔧 O **"como"** — regras práticas de implementação | "Use tags semânticas no HTML, nunca `<div>`" |

---

## 📂 Estrutura da pasta `.ia/`

```
.ia/
├── readme.md                  ← 📘 Você está aqui!
├── copilot-instructions.md    ← Instruções resumidas para qualquer LLM
│
├── agents/                    ← 📋 Contexto para planejamento
│   ├── AGENTS.md              ← Contexto geral do projeto (arquitetura, pastas, fluxo)
│   └── AGENT-frontend-design.md  ← Planejamento visual (telas, componentes, navegação)
│
└── skills/                    ← 🔧 Regras para gerar código
    └── SKILL-frontend-design.md  ← Como criar HTML/CSS/JS corretamente
```

---

## 🎯 Como usar com diferentes ferramentas

Cada ferramenta de IA tem um jeito diferente de receber instruções. Aqui vai o **passo a passo para cada caso**:

### 💻 1. GitHub Copilot (VS Code / JetBrains)

O Copilot **lê automaticamente** a pasta `.github/`. Como criamos **stubs** (redirecionadores) lá, o Copilot é informado de que o conteúdo real está em `.ia/`.

> ✅ **Você não precisa fazer nada** — o Copilot já funciona.
>
> ⚠️ Se quiser que ele **use ativamente** os agents, **copie o conteúdo** relevante no **chat** do Copilot ao fazer uma pergunta:
>
> ```md
> Contexto: .ia/agents/AGENT-frontend-design.md
> Skill: .ia/skills/SKILL-frontend-design.md
>
> Crie a tela de login seguindo as regras acima.
> ```

### 🖥️ 2. Cursor

1. Vá em **Settings > Rules**
2. Adicione no campo "Rules for AI":
   ```md
   Leia .ia/copilot-instructions.md antes de qualquer resposta.
   Consulte .ia/agents/AGENTS.md para contexto do projeto.
   Consulte a skill relevante em .ia/skills/ antes de gerar código.
   ```

### 🤖 3. Claude (claude.ai / Claude Desktop)

**Opção A — Projeto (Claude Pro/Team):**
1. Crie ou edite um **Project**
2. Adicione como **instrução personalizada**:
   ```md
   Leia os arquivos em .ia/agents/ e .ia/skills/ antes de responder.
   ```
3. **Faça upload** dos arquivos `.ia/` que deseja usar (.md)

**Opção B — Conversa avulsa:**
> Cole no início do chat:
> ```md
> 📘 Contexto do projeto: [cole o conteúdo de .ia/agents/AGENTS.md]
> 🎨 Skill de frontend: [cole o conteúdo de .ia/skills/SKILL-frontend-design.md]
>
> Com base nisso, crie a tela de login.
> ```

### 🧠 4. ChatGPT

> Cole no início da conversa:
> ```md
> Você é um assistente especializado no projeto acme-3am.
>
> 📋 Contexto do projeto: [cole AGENTS.md]
> 🔧 Skill aplicável: [cole SKILL-frontend-design.md]
>
> Responda sempre em Português do Brasil.
> Código, nomes de arquivos, classes e variáveis em inglês.
> ```

---

## 📋 Exemplo prático — "Quero criar uma tela"

### Passo 1: Leia o Agent de frontend

> 📂 `agents/AGENT-frontend-design.md`

Este arquivo contém o contexto visual das áreas já existentes:
- área pública e autenticação de assessores;
- área do assessor em `app/`;
- painel administrativo em `admin/`;
- área do corredor em `runner/`.

Ao criar uma nova tela, atualize o agent com decisões permanentes antes de
implementar. Não reintroduza placeholders já resolvidos.

### Passo 2: Aplique a Skill de frontend

> 📂 `skills/SKILL-frontend-design.md`

Este arquivo diz para a IA **como gerar o código**:
- ✅ Tags semânticas (`<header>`, `<main>`, `<section>`, `<footer>`)
- ✅ CSS em arquivo separado
- ✅ JS com `document.querySelector`, sem jQuery
- ✅ Separe mocks de clientes HTTP e marque estados temporários
- ❌ Nunca `<div>` para layout quando um elemento semântico servir
- ❌ Nunca eventos inline `onclick=""`

### Passo 3: Peça para a IA gerar

Com base no contexto atual e na skill, peça:

> "Crie a tela do corredor seguindo as regras da skill de frontend."

A IA saberá:
- Onde colocar os arquivos da área correta (`views/assets/public/`,
  `views/assets/app/`, `views/assets/admin/` ou `views/assets/runner/`)
- Como estruturar o HTML
- Como escrever o CSS e o JS

---

## 🏗️ Quando criar um novo Agent ou Skill

### Novo Agent (📋 contexto)

Crie quando precisar documentar **uma área nova de planejamento**. Exemplos:
- `AGENT-web-service.md` → contexto da API REST
- `AGENT-data-base.md` → contexto do banco de dados

### Nova Skill (🔧 regras)

Crie quando precisar definir **regras de implementação** para uma área. Exemplos:
- `SKILL-php-backend.md` → como escrever controllers e models
- `SKILL-sql-queries.md` → padrões de consulta SQL

---

## ⚠️ Regras importantes

1. **Edite sempre em `.ia/`** — é a fonte oficial
2. **Não edite em `.github/`** — lá só tem redirecionadores
3. **Mantenha o padrão:** Agents explicam **o quê**, Skills explicam **como**
4. **Escreva em Português do Brasil** — conteúdo é para estudantes
5. **Código e nomes em inglês** — identificadores, classes, funções, arquivos

---

## 🔗 Resumo visual

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   📘 STUDENT READS → .ia/readme.md (você está aqui)         │
│                                                              │
│   📋 AGENT → O que fazer?                                    │
│   ├── .ia/agents/AGENTS.md          → Contexto do projeto    │
│   └── .ia/agents/AGENT-frontend...  → Planejamento visual    │
│                                                              │
│   🔧 SKILL → Como fazer?                                     │
│   └── .ia/skills/SKILL-frontend...  → Regras de código       │
│                                                              │
│   💬 LLM → Usa agent + skill para gerar código               │
│                                                              │
│   🎉 RESULTADO → Código correto, no lugar certo              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

> 💡 **Dica final:** Agents e skills **não são só para IAs** — eles também ajudam **você, estudante**, a organizar as ideias antes de programar. Preencher um Agent é como fazer um **rascunho** do que você vai construir. A Skill é a **lista de checagem** para não esquecer as regras.