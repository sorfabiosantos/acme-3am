# SE2 — Etapa 07 — Upload de imagens e arquivos

## Objetivo

Estender o sistema da Etapa 06 para enviar, armazenar e exibir imagens usando a
API da equipe. Implemente dois casos: a foto do usuário autenticado e várias
imagens associadas a um produto. O produto deve ter uma relação **1:N** com as
imagens: um produto pode ter nenhuma, uma ou várias imagens, e cada imagem
pertence a um único produto.

Consulte as rotas, os controllers, os models e os exemplos do frontend já
existentes antes de implementar. A classe de suporte para gravar uploads já
está disponível em `api/source/Support/Upload.php`; use-a nas soluções PHP em
vez de implementar novamente o recebimento e a validação do arquivo.

## Premissas e responsabilidades

- O backend valida autenticação, autorização, dados e arquivos. Validações no
  frontend melhoram a experiência, mas não substituem as do servidor.
- O navegador envia imagens como `multipart/form-data`; não converta os arquivos
  para Base64 nem os envie dentro de JSON.
- O banco armazena os metadados e o caminho/nome gerado do arquivo. O conteúdo
  binário da imagem fica no sistema de arquivos, salvo se a equipe justificar e
  documentar outra solução.
- Use `HttpClientBase` e os serviços existentes no frontend. Não espalhe
  chamadas `fetch` pelas telas.
- Consulte a documentação e o contrato real da API. Se criar ou alterar rotas,
  documente os métodos, parâmetros, campos multipart, respostas e permissões no
  README da equipe.

## Parte A — Foto do usuário autenticado

Implemente o fluxo de atualização da foto do usuário que está logado. A
identidade do usuário deve vir do token validado pelo backend, nunca de um ID
enviado pelo formulário para escolher qual perfil será alterado.

1. Crie na interface de perfil um seletor de imagem e uma ação para enviar a
   foto. Mostre uma prévia antes do envio e a imagem atual depois do sucesso.
2. Envie o arquivo em `FormData` usando o nome de campo definido pela API. A
   requisição deve incluir o token de autenticação e não deve definir
   manualmente o cabeçalho `Content-Type` do multipart.
3. No controller, verifique autenticação e permissão, a existência do upload e
   o usuário autenticado. Use `Source\Support\Upload` para validar e gravar
   a imagem. Persista no perfil o caminho relativo ou nome retornado pela
   classe, conforme o modelo de dados da equipe.
4. Retorne uma resposta padronizada contendo a URL ou o caminho necessário para
   exibir a nova foto. Quando uma foto anterior gerenciada pela aplicação for
   substituída, remova o arquivo antigo somente depois que a atualização do
   banco for concluída com sucesso.
5. Trate ausência de arquivo, arquivo inválido, tamanho excedido, falha de
   autenticação, perfil inexistente e falha de persistência com respostas
   coerentes. Uma falha não pode ser exibida como sucesso.

A rota existente `POST /users/photo` e o método `Users::uploadPhoto` servem
como referência do contrato e do comportamento esperado. Nesta etapa, os alunos
devem compreender, integrar e demonstrar esse fluxo no frontend; o backend deve
ser completado ou adaptado pela equipe se necessário.

## Parte B — Galeria de imagens do produto (relação 1:N)

Associe várias imagens a um produto existente. A equipe pode escolher o fluxo
de upload de uma imagem por requisição ou de várias imagens em uma requisição,
desde que a associação ao produto seja persistida corretamente e a interface
permita administrar a galeria.

### Banco de dados

Crie uma tabela filha para os metadados das imagens. O exemplo abaixo usa
MySQL 8 e `products` como entidade principal; ajuste nomes e campos conforme o
modelo real do projeto, mantendo a chave estrangeira e a cardinalidade 1:N.

```sql
CREATE TABLE `product_images` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `product_id` INT NOT NULL,
    `image_path` VARCHAR(255) NOT NULL,
    `alt_text` VARCHAR(255) DEFAULT NULL,
    `position` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_product_images_product_id` (`product_id`),
    CONSTRAINT `fk_product_images_product`
        FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Inclua o script de criação ou migração no repositório e atualize a
documentação do banco. Não coloque uma lista de imagens em uma coluna do
produto, nem use uma tabela com uma única coluna de foto: cada imagem deve ser
um registro relacionado a `product_id`.

### API e persistência

Implemente as operações necessárias para:

- enviar uma ou mais imagens para um produto existente;
- listar as imagens de um produto;
- remover uma imagem específica sem remover as demais imagens do produto.

O contrato pode seguir, por exemplo, estes formatos — ajuste os caminhos às
convenções da API e registre os caminhos finais no README:

| Operação | Exemplo de rota | Dados principais |
|---|---|---|
| Enviar imagem(ns) | `POST /products/{product_id}/images` | `FormData` com `images[]` (ou `image`) |
| Listar galeria | `GET /products/{product_id}/images` | identificador do produto |
| Remover imagem | `DELETE /products/{product_id}/images/{image_id}` | produto e imagem |

O controller deve validar o produto, autenticar e autorizar a operação de
acordo com as regras do sistema, chamar `Upload::image()` para cada arquivo e
delegar a persistência dos metadados a um Model com prepared statements. Não
confie no nome, extensão ou tipo MIME declarados pelo navegador. Configure os
limites do PHP (`upload_max_filesize` e `post_max_size`) de forma compatível com
os limites usados pela classe.

Se a gravação do arquivo funcionar e a inclusão do registro no banco falhar,
remova o arquivo recém-gravado. Ao remover uma imagem, confira que ela pertence
ao produto informado, remova o registro e depois o arquivo correspondente. Não
permita que um usuário apague imagens fora do escopo de autorização dele. Ao
excluir um produto, trate também seus metadados e arquivos para não deixar
arquivos órfãos; a chave estrangeira cuida do registro em cascata, mas não
remove arquivos do disco.

As respostas devem seguir o padrão da API e retornar identificadores, caminho
ou URL pública necessária para exibição e, na listagem, os dados de cada
imagem. Não exponha caminhos absolutos do servidor.

## Parte C — Integração com o frontend

1. Implemente um serviço de imagens que estenda `HttpClientBase` e use o token
   da sessão. Para multipart, passe `FormData` ao método compatível do cliente
   (`post` ou `postForm`, conforme a implementação existente); deixe o
   navegador definir o boundary de `Content-Type`.
2. Integre o fluxo de foto do perfil e a galeria à tela apropriada. A tela deve
   listar as imagens já persistidas após carregar ou atualizar a página.
3. Permita selecionar arquivos, ver prévias e, se necessário, remover uma
   imagem específica. Atualize a interface após a resposta da API sem exigir
   recarregamento completo.
4. Mostre estados de envio/carregamento, lista vazia, sucesso e erro. Informe
   claramente formatos e limites aceitos; bloqueie no frontend arquivos que já
   possam ser reconhecidos como inválidos, mantendo a validação final no
   backend.
5. Escape ou trate corretamente textos alternativos e demais dados exibidos.
   Não confie em URLs fornecidas pelo usuário nem use o nome original do
   arquivo como nome de armazenamento.

## Entrega e avaliação

Entregue a implementação com:

- upload e exibição da foto do usuário autenticado;
- tabela de imagens do produto com chave estrangeira e relação 1:N;
- Model, controller e rotas para enviar, listar e remover imagens de produto;
- uso de `Source\Support\Upload` para gravar imagens;
- interface de galeria integrada à API e associada ao produto correto;
- tratamento de autenticação, erros de arquivo, persistência e remoção;
- script/migração do banco, README com contratos das rotas e instruções de
  execução;
- evidências do fluxo funcionando, incluindo um produto com pelo menos duas
  imagens e a atualização da página mantendo a galeria.

## Critérios de aceite

A etapa está concluída quando o usuário autenticado consegue atualizar sua
foto; um produto consegue receber várias imagens independentes; os metadados
ficam registrados na tabela filha com `product_id`; a listagem retorna somente
as imagens do produto solicitado; remover uma imagem preserva as demais; e a
interface apresenta corretamente carregamento, sucesso, lista vazia e erros.
Arquivos rejeitados pelo backend não podem ser associados ao produto, e
falhas de banco não podem deixar arquivos novos sem referência.

Será avaliada a correspondência entre banco, API e interface, a validação no
servidor, a autorização, a organização entre Controller e Model, o uso correto
da classe `Upload`, a consistência entre registros e arquivos e a clareza da
documentação. Não basta selecionar um arquivo na tela ou salvar somente o
caminho em memória: os fluxos devem persistir e ser demonstráveis após novo
carregamento.
