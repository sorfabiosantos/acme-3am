# 📁 api/source/Support/

## Helpers — Funções Auxiliares

---

### 🎯 Para que serve esta pasta?

A pasta `Support/` contém **funções auxiliares** (helpers) que podem ser usadas em **qualquer
parte** do projeto. São funções utilitárias que facilitam tarefas repetitivas do dia a dia.

---

### 📂 Arquivo principal

```
Support/
├── Helpers.php    ← Funções auxiliares globais
└── Upload.php     ← Validação e armazenamento de arquivos enviados
```

### Upload — imagens e arquivos

`Source\Support\Upload` recebe o caminho da pasta de destino no construtor.
As configurações são propriedades públicas; os limites usam bytes e os tipos
permitidos são MIME types em listas independentes:

| Propriedade | Padrão |
|---|---|
| `maxFileSize` | 10 MiB |
| `maxImageSize` | 5 MiB |
| `allowedFileTypes` | PDF, ZIP, DOCX, XLSX e PPTX |
| `allowedImageTypes` | JPEG, PNG e WEBP |

```php
use Source\Support\Upload;

$upload = new Upload(__DIR__ . '/../../uploads');
$upload->maxImageSize = 2 * 1024 * 1024;
$upload->allowedImageTypes = ['image/jpeg', 'image/png'];

$storedImageName = $upload->image($_FILES['image']);
$storedFileName = $upload->file($_FILES['document']);
```

Os métodos recebem o item de `$_FILES` e retornam o nome aleatório salvo na
pasta configurada. Em caso de erro, lançam `RuntimeException`; o controller
deve capturá-la e produzir a resposta HTTP apropriada. O tipo é identificado
pelo conteúdo com `fileinfo` (e imagens também são verificadas com
`getimagesize`), não pela extensão ou pelo nome original enviado pelo cliente.

Configure também `upload_max_filesize` e `post_max_size` no PHP para que os
limites do servidor sejam compatíveis com os limites desta classe. Em produção,
prefira armazenar os arquivos fora da pasta pública e servir downloads por uma
rota autorizada.

---

### 💡 Exemplo de uso

```php
<?php

/**
 * Retorna uma resposta JSON padronizada
 *
 * @param int    $code    Código HTTP (200, 201, 400, 404, 500...)
 * @param string $status  "success" ou "error"
 * @param string $message Mensagem descritiva
 * @param mixed  $data    Dados a serem retornados (opcional)
 */
function response(int $code, string $status, string $message, mixed $data = null): void
{
    http_response_code($code);
    header("Content-Type: application/json");

    echo json_encode([
        "status"  => $status,
        "message" => $message,
        "data"    => $data
    ]);
}

/**
 * Sanitiza (limpa) uma string removendo tags HTML e espaços extras
 *
 * @param string $value Valor a ser sanitizado
 * @return string Valor limpo
 */
function sanitize(string $value): string
{
    return htmlspecialchars(strip_tags(trim($value)));
}

/**
 * Verifica se o método HTTP da requisição é o esperado
 *
 * @param string $method Método esperado (GET, POST, PUT, DELETE)
 * @return bool
 */
function isMethod(string $method): bool
{
    return $_SERVER["REQUEST_METHOD"] === strtoupper($method);
}
```

---

### 🧰 Exemplos de helpers comuns em projetos web

| Função          | O que faz                                        |
|-----------------|--------------------------------------------------|
| `response()`    | Retorna uma resposta JSON padronizada            |
| `sanitize()`    | Limpa dados de entrada contra XSS                |
| `isMethod()`    | Verifica o método HTTP da requisição             |
| `redirect()`    | Redireciona o usuário para outra URL             |
| `isEmail()`     | Valida se um texto é um e-mail válido            |
| `generateSlug()`| Converte "Olá Mundo" em "ola-mundo"              |

---

### 🔗 Quem usa os Helpers?

- **Controllers** — para formatar respostas e validar dados
- **Models** — para sanitizar dados antes de salvar no banco
- **Qualquer classe** do projeto que precise de uma função utilitária

---

> 💡 **Dica:** Helpers são funções **genéricas e reutilizáveis**. Se você perceber que está
> repetindo o mesmo código em vários lugares, considere criar um helper!
