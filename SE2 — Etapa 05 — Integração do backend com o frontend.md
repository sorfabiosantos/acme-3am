# SE2 — Etapa 05 — Integração do backend com o frontend

## Objetivo

Integrar as telas do frontend ao web service da equipe, substituindo dados
estáticos e chamadas improvisadas por requisições assíncronas para a API.
Parte-se do princípio de que as rotas do backend já estão prontas e foram
entregues nas etapas anteriores do trabalho. As regras de negócio, validações,
autenticação, autorização e formatos de resposta já definidos nessas etapas
devem ser respeitados nesta integração.

## Premissas e fonte de consulta

Não é necessário criar ou alterar as rotas nesta etapa. Antes de iniciar o
frontend, consulte a pasta `api/` e os controllers para obter informações sobre:

- endpoints, métodos HTTP, parâmetros e corpos das requisições;
- formato das respostas, mensagens e códigos HTTP;
- autenticação, autorização e perfis de acesso;
- comportamento de exclusão lógica, quando aplicável.

As regras definidas nas etapas anteriores continuam sendo a referência
oficial. Se houver divergência entre a tela e a API, adapte o frontend ao
contrato já definido; não crie uma regra paralela no cliente.

## Cadastro e login de usuários

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

## Token e `localStorage`

Após um login bem-sucedido, a API retorna o token dentro de `data.token`.
Esse token representa a sessão do usuário; ele não substitui a validação do
backend e não deve ser confundido com a senha. Para esta atividade, armazene o
token no `localStorage` por meio da classe compartilhada
`views/assets/_common/scripts/storage.js`:

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

`SessionStorage` cria chaves diferentes para cada área. O escopo padrão usa
`running_power_token` e o escopo `runner` usa `running_power_runner_token`.
Isso evita que sessões de áreas diferentes sobrescrevam umas às outras. O
logout deve remover os dados da sessão:

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
HTTP:

```js
const token = this.storage.getToken();
this.api.forEach((client) => client.setAuthToken(token));
```

`HttpClientBase` transforma esse token no cabeçalho `Authorization` usando o
esquema Bearer. No backend, `api/source/Controller/Api.php` aceita o cabeçalho,
remove o prefixo do esquema, decodifica o JWT e verifica o tipo de usuário:

```php
$token = $header['Authorization'] ?? $header['authorization'] ?? null;

if (str_starts_with($token, 'Bearer ')) {
    $token = substr($token, 7);
}

$jwtToken = $jwt->decode($token);
```

`AuthGuard` pode bloquear a navegação no frontend, mas a segurança real
acontece no backend, que deve validar assinatura, expiração, usuário e
permissão em toda rota protegida.

`localStorage` é utilizado por ser o padrão didático do projeto e permanece
após o fechamento do navegador. Nunca armazene senha, dados sensíveis ou o
segredo usado para assinar o JWT. Em produção, avalie uma sessão em cookie
`HttpOnly`, `Secure` e com política `SameSite` adequada.

## Formato de resposta

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

## Requisitos do frontend

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

## Critérios de aceite

A etapa estará concluída quando o CRUD puder ser executado pelas telas, o
cadastro e o login criarem uma sessão válida, uma rota protegida exigir
autenticação, o logout encerrar a sessão, os dados permanecerem após atualizar
a página e as respostas `2xx`, `4xx` e `5xx` produzirem mensagens
compreensíveis. Mocks devem ser identificados e não podem substituir
silenciosamente uma rota integrada.