# 📁 `.github/` — Para o GitHub Copilot ler automaticamente

> 📖 **Leia primeiro:** [`.ia/readme.md`](../.ia/readme.md) (explicação completa)  
> 🎯 **Público:** Estudantes que usam **GitHub Copilot** no VS Code / JetBrains

---

## 🤔 O que é esta pasta?

A pasta `.github/` é um **padrão do GitHub**. O **GitHub Copilot** (a inteligência artificial dentro do VS Code) **procura automaticamente** por arquivos aqui dentro para entender o contexto do projeto.

## 📄 O que tem aqui?

| Arquivo | Para que serve | Status |
|---|---|---|
| `copilot-instructions.md` | Instruções que o Copilot **lê sozinho** ao sugerir código | 🔀 Redireciona para `.ia/` |
| `agents/AGENTS.md` | Contexto geral do projeto para o Copilot | 🔀 Redireciona para `.ia/` |
| `agents/AGENT-frontdend-design.md` | Planejamento visual do frontend | 🔀 Redireciona para `.ia/` |
| `skills/SKILL-frontend-design.md` | Regras práticas de como gerar frontend | 🔀 Redireciona para `.ia/` |

## 🔀 Por que "redireciona"?

Originalmente todo conteúdo ficava aqui dentro. Para **unificar** o conhecimento e **funcionar com qualquer ferramenta** (não só Copilot), movemos o conteúdo para a pasta `.ia/`.

Agora estes arquivos funcionam como **placas de sinalização**:
> ⚠️ "O conteúdo original está em `.ia/` — vá até lá!"

## 🎓 Para o estudante

- ✅ **Usa GitHub Copilot?** Deixe quieto — ele lê `copilot-instructions.md` e os stubs automaticamente
- ✅ **Quer editar agents/skills?** Edite em `.ia/`, **não aqui**
- ❌ **Não crie conteúdo novo aqui** — crie em `.ia/`

---

> 🔗 Tudo o que você precisa está em [`.ia/readme.md`](../.ia/readme.md)