# DUMELHOR — Loja de Encomendas Online
### GitHub Pages — Carrinho de Compras para Clientes

---

## 📁 Estrutura de Ficheiros

```
dumelhor-shop/
├── index.html          ← Loja para clientes (este ficheiro)
├── produtos.json       ← Lista de produtos (gerado pelo script)
├── converter_excel.py  ← Script Python para converter Excel → JSON
└── images/
    ├── logo.png        ← Logo da empresa (aparece no cabeçalho)
    ├── 1001.jpg        ← Foto do produto com código 1001
    ├── 1002.jpg        ← Foto do produto com código 1002
    ├── milka.png       ← Logo da marca MILKA (para o menu)
    ├── compal.png      ← Logo da marca COMPAL
    └── ...             ← (outras fotos de produtos e marcas)
```

---

## 🚀 Como Publicar no GitHub Pages

1. **Criar repositório** no GitHub (ex: `dumelhor-loja`)
2. **Fazer upload** de todos estes ficheiros
3. Nas **Settings → Pages** → selecionar branch `main` → pasta `/root`
4. A loja fica acessível em: `https://SEU-UTILIZADOR.github.io/dumelhor-loja`

---

## 📊 Como Converter o Excel

```bash
# Instalar dependência (uma única vez)
pip install openpyxl

# Converter o Excel
python converter_excel.py LISTA_PRODUTOS.xlsx

# O ficheiro produtos.json é criado automaticamente
```

### Colunas aceites no Excel (não sensível a maiúsculas/acentos):
| Coluna Excel | Campo |
|---|---|
| Código / Ref | id |
| Nome / Produto / Descrição | nome |
| Preço / PVP / Valor | preco |
| Unidade / Un | un |
| Família / Categoria | familia |
| Marca / Brand | marca |

---

## 🖼️ Imagens dos Produtos

- Coloque as fotos na pasta **`images/`**
- O nome do ficheiro deve ser o **código do produto** + extensão
  - Exemplo: produto com código `1001` → ficheiro `images/1001.jpg`
- Formatos aceites: `.jpg`, `.jpeg`, `.png`, `.webp`
- Se não houver foto, aparece um ícone 📦 automático

### Imagens de Marcas (para o menu lateral):
- Nome: marca em minúsculas, espaços substituídos por `-`
  - Exemplo: marca `COCA COLA` → ficheiro `images/coca-cola.png`
  - Exemplo: marca `MILKA` → ficheiro `images/milka.png`
- Logo da empresa: `images/logo.png`

---

## ⚙️ Configuração (index.html)

No início do JavaScript do `index.html`, edite as variáveis:

```javascript
const CONFIG = {
    whatsapp: '351999000000',  // ← SEU número WhatsApp (sem +)
    nomeLoja: 'DUMELHOR',      // ← Nome da loja
    produtosJson: 'produtos.json',
    imagesDir: 'images/',
};
```

---

## 🛒 Como Funciona para o Cliente

1. Abre a loja no browser (link do GitHub Pages)
2. Usa o **menu ☰** para filtrar por marca (com logotipos)
3. Usa a **pesquisa** para encontrar produtos rapidamente
4. Clica num produto → escolhe a quantidade → **Adicionar**
5. Quando terminar → **VER CARRINHO**
6. Preenche o nome e clica **ENVIAR ENCOMENDA POR WHATSAPP**
7. A encomenda é enviada formatada diretamente por WhatsApp

---

## 📱 Compatibilidade

- ✅ Mobile (iOS Safari, Android Chrome)
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Sem aplicação para instalar — funciona no browser
- ✅ Não precisa de servidor — é 100% estático (GitHub Pages)
