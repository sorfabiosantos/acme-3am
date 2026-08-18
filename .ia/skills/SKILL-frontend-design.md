# Skill de Frontend Design

## Aplicação

Use esta skill ao criar ou editar HTML, CSS ou JavaScript nas áreas `public`,
`app`, `admin` e `runner`, ou componentes compartilhados em `_common`.

Antes de editar, leia:

1. `.ia/copilot-instructions.md`;
2. `.ia/agents/AGENTS.md`;
3. `.ia/agents/AGENT-frontend-design.md`.

## Regras de implementação

- Use HTML semântico: `header`, `nav`, `main`, `section`, `article`, `aside`,
  `form`, `fieldset`, `footer`, `ul` e `ol`.
- Use `<table>` somente para dados genuinamente tabulares, como a lista
  administrativa de FAQs.
- Não use `<div>` como estrutura de layout quando um elemento semântico for
  apropriado.
- CSS deve ficar em arquivo separado; evite estilos inline.
- JavaScript deve usar classes e módulos ES.
- Registre eventos no JavaScript; nunca use `onclick`, `onsubmit` ou similares.
- Use `document.querySelector` e `document.querySelectorAll`.
- Não use jQuery.
- Use `HttpClientBase` por meio de classes de domínio em `_common/classes`.
- Não confie em dados de sessão do navegador para autorizar ações.

## Isolamento por área

| Área | Entrada | Assets |
|---|---|---|
| Pública | `index.html` | `views/assets/public/` |
| Assessor | `app/index.html` | `views/assets/app/` |
| Admin | `admin/index.html` | `views/assets/admin/` |
| Corredor | `runner/index.html` | `views/assets/runner/` |

Não coloque componentes específicos do corredor no dashboard do assessor.
Recursos compartilhados devem ir em `_common/`.

## Sessões

Ao criar uma página protegida:

- use `SessionStorage` com o escopo da área;
- use `AuthGuard` com a URL de redirecionamento correta;
- informe `expectedTypeId` quando a área exigir um perfil específico;
- limpe a sessão ao fazer logout;
- trate token ausente e perfil inválido com estado de acesso negado.

## Mocks e integração

Mantenha dados mockados em arquivos próprios, como `runner-mock-data.js`.
Identifique visualmente estados temporários com mensagens como “Modo
demonstração” ou “Mock temporário”. Não trate erro da API como lista vazia.

Para integração:

```js
import Workouts from "../../_common/classes/Workouts.js";

const client = new Workouts();
client.setAuthToken(storage.getToken());
const result = await client.listMine();
```

Exiba estados de carregamento, sucesso, erro e vazio. Mensagens devem ser
inline ou toast acessível, nunca `alert()`.

## Checklist

- [ ] Área e pasta corretas
- [ ] HTML semântico
- [ ] CSS separado
- [ ] Sem eventos inline ou jQuery
- [ ] JavaScript modular e orientado a objetos
- [ ] API consumida por `HttpClientBase`
- [ ] Sessão e tipo de usuário corretos
- [ ] Mock explicitamente identificado
- [ ] Estados de loading, vazio, erro e sucesso
- [ ] Navegação por teclado e foco visível
