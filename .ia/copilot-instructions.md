# 🤖 Instruções centrais para LLMs (.ia/)

Este repositório é um **scaffold didático em MVC** para a disciplina de **Programação Web II**.

## 📖 Referências importantes

- **README.MD** (raiz) → visão geral do projeto
- `.ia/agents/` → documentação de contexto para agentes de IA
- `.ia/skills/` → skills operacionais de como gerar código

## 🌐 Idioma

- Conteúdo textual / documentação → **Português do Brasil**
- Código, identificadores, nomes de arquivo → **English**

## 🏗️ Convenções do MVC

| Camada | Responsabilidade |
|--------|-----------------|
| Controller | Orquestra requisições, valida, retorna JSON |
| Model | SQL, acesso a banco, regras de negócio |
| View (assets) | Consome API, SEM regra de negócio ou acesso a banco |

## 🔗 Fluxo de requisição

```
index.html / JS → api/.htaccess → api/index.php → Core/Router → Controller/Api → Models → MySQL
                                                    ↓
                                               Resposta JSON
```

## 🎨 Frontend

- HTML **semântico** (nunca `<div>` ou `<table>` para layout)
- CSS em arquivo separado
- JS: `document.querySelector`, eventos via código, HttpClientBase.js para API
- jQuery proibido, eventos inline proibidos

## 📁 Pastas do projeto

```
acme-3am/
├── .ia/               ← Agents & Skills (neutro, multi-ferramenta)
├── .github/           ← GitHub específico (stubs apontam para .ia/)
├── api/               ← Backend PHP (MVC)
├── data-base/         ← Scripts SQL
├── storage/           ← Uploads, logs, cache
└── views/             ← Frontend
    └── assets/
        ├── _common/   ← Recursos compartilhados
        ├── public/    ← Área pública
        ├── app/       ← Área logada
        └── admin/     ← Painel administrativo
```

## ✅ Orientações para LLMs

1. Sempre leia `.ia/agents/AGENTS.md` para contexto geral antes de qualquer alteração
2. Consulte a skill relevante em `.ia/skills/` antes de gerar código
3. Mantenha as fronteiras do MVC estritas
4. Use prepared statements nos models (placeholders `:id`, `:name`, etc.)
5. Respostas da API devem ser JSON
6. Recursos compartilhados de frontend em `_common/`