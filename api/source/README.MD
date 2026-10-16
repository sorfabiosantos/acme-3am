# 📁 api/source/

## O Código-Fonte — Organização MVC

---

### 🎯 Para que serve esta pasta?

A pasta `source/` contém **todo o código-fonte** escrito por nós, organizado seguindo o padrão **MVC**.
Cada subpasta tem uma responsabilidade clara e específica.

---

### 📂 Estrutura desta pasta

```
source/
├── Config/         ← Configurações do sistema (banco, constantes)
├── Controller/     ← Controllers — recebem requisições e retornam respostas
├── Core/           ← Núcleo — classes fundamentais do framework (Router, Connect)
├── Models/         ← Models — representam as tabelas do banco de dados
└── Support/        ← Helpers — funções utilitárias auxiliares
```

---

### 🧩 Como as pastas se relacionam?

```
Requisição HTTP
      ↓
[Core/Router.php]       → Analisa a URL e encontra o Controller certo
      ↓
[Controller/Api.php]    → Executa a lógica de negócio
      ↓
[Models/User.php]       → Consulta/salva dados no banco
      ↓
[Core/Connect.php]      → Fornece a conexão PDO com o banco
      ↓
[Config/Config.php]     → Fornece as credenciais e configurações
      ↓
[Support/Helpers.php]   → Funções auxiliares usadas em qualquer lugar
```

---

### 📖 Conceito: Namespaces em PHP

Cada pasta corresponde a um **namespace** (espaço de nomes) no PHP.
Namespaces organizam as classes e evitam conflitos de nomes.

```php
// A classe User está no namespace source\Models
namespace source\Models;

class User
{
    // ...
}
```

Para usar essa classe em outro arquivo:
```php
use source\Models\User;

$usuario = new User();
```

> 💡 O **Composer** faz o carregamento automático (autoload) das classes baseado nos namespaces.

---

### 📤 Upload de imagens e arquivos

A classe `Source\Support\Upload`, localizada em `Support/Upload.php`, valida e
armazena um arquivo enviado pelo PHP. O construtor recebe a pasta de destino;
os limites de tamanho são em bytes e os tipos aceitos são MIME types.

| Propriedade | Padrão |
|---|---|
| `maxFileSize` | 10 MiB |
| `maxImageSize` | 5 MiB |
| `allowedFileTypes` | PDF, ZIP, DOCX, XLSX e PPTX |
| `allowedImageTypes` | JPEG, PNG e WEBP |

Os métodos `image()` e `file()` recebem o item correspondente de `$_FILES` e
retornam o nome aleatório gravado na pasta configurada. Erros de validação ou
gravação são informados por `RuntimeException`.

```php
use Source\Support\Upload;

$uploadDirectory = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . "users";
$upload = new Upload($uploadDirectory);
$filename = $upload->image($_FILES["photo"]);

// Persista um caminho relativo; gere uma URL completa apenas para a resposta da API.
$photoPath = "uploads/users/" . $filename;
$photoUrl = url($photoPath);
```

O tipo do conteúdo é verificado com `fileinfo`; para imagens também é usado
`getimagesize`. Configure `upload_max_filesize` e `post_max_size` no PHP de
acordo com os limites escolhidos. Prefira uma pasta que não permita execução de
scripts enviados pelo usuário.

---

> 📚 Acesse cada subpasta para entender sua responsabilidade em detalhes.
