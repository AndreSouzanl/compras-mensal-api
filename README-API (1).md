# 🛒 ComprasMensal — API

> API REST desenvolvida com Node.js + Express + Supabase  
> Desenvolvido por: DevSouza

---

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Configuração](#-configuração)
- [Banco de Dados](#-banco-de-dados)
- [Middlewares](#-middlewares)
- [Serviços](#-serviços)
- [Validações](#-validações)
- [Rotas](#-rotas)
- [Testando com Postman](#-testando-com-postman)
- [Como Rodar](#-como-rodar)

---

## 🚀 Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4.18+ | Servidor HTTP |
| Supabase | 2.0+ | Banco de dados PostgreSQL |
| bcryptjs | 2.4+ | Criptografia de senhas |
| jsonwebtoken | 9.0+ | Autenticação JWT |
| dotenv | 16.0+ | Variáveis de ambiente |
| cors | 2.8+ | Cross-Origin Resource Sharing |
| nodemon | 3.0+ | Dev — reinicia automaticamente |

---

## 📁 Estrutura do Projeto

```
compras-mensal-api/
├── src/
│   ├── conexao/
│   │   └── supabase.js             ← client de conexão com Supabase
│   ├── middleware/
│   │   └── auth.js                 ← validação do token JWT
│   ├── router/
│   │   ├── router_autenticacao.js  ← rotas de login
│   │   ├── router_produtos.js      ← rotas de produtos
│   │   └── router_usuarios.js      ← rotas de usuários
│   ├── servicos/
│   │   ├── servico_autenticacao.js ← lógica de autenticação
│   │   ├── servico_produto.js      ← lógica de produtos
│   │   └── servico_usuario.js      ← lógica de usuários
│   ├── validacao/
│   │   ├── valida_produto.js       ← validação de dados do produto
│   │   └── valida_usuario.js       ← validação de dados do usuário
│   └── index.js                    ← entrada da aplicação
├── .env                            ← variáveis de ambiente (não commitar!)
├── .env.example                    ← exemplo de variáveis
├── .gitignore
└── package.json
```

---

## ⚙️ Configuração

### `package.json`

```json
{
  "name": "compras-mensal-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

> 💡 `"type": "module"` habilita ES Modules — por isso todos os imports
> precisam ter a extensão `.js` no final!

### Variáveis de Ambiente — `.env`

```env
PORT=8080
SUPABASE_URL=https://sckrlejlpsbzaeupnwrc.supabase.co
SUPABASE_SECRET_KEY=sua_secret_key_aqui
JWT_SECRET=comprasmensal@2026
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### `.env.example`

```env
PORT=8080
SUPABASE_URL=
SUPABASE_SECRET_KEY=
JWT_SECRET=
JWT_EXPIRES_IN=7d
FRONTEND_URL=
```

> ⚠️ Nunca commite o `.env` real! Adicione no `.gitignore`

---

## 🗄️ Banco de Dados

### Conexão — `src/conexao/supabase.js`

```js
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)
```

> 💡 Usamos a **Secret key** no backend para ter acesso total ao banco.
> A Publishable key é para uso no frontend diretamente.

### Por que Supabase Client em vez de SQL puro?

```js
// ❌ SQL puro — mais verboso e risco de SQL injection
await pool.query("SELECT * FROM produtos WHERE criado_por = $1", [id])

// ✅ Supabase Client — legível, seguro e sem gerenciar conexões
const { data } = await supabase
  .from("produtos")
  .select("*")
  .eq("criado_por", id)
```

### Tabelas

#### `usuarios`

```sql
CREATE TABLE usuarios (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  senha       TEXT NOT NULL,
  criado_em   TIMESTAMP DEFAULT NOW()
);
```

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária automática |
| `nome` | TEXT | Nome completo |
| `email` | TEXT | E-mail único |
| `senha` | TEXT | Hash bcrypt — nunca texto puro! |
| `criado_em` | TIMESTAMP | Data automática |

#### `produtos`

```sql
CREATE TABLE produtos (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome          TEXT NOT NULL,
  descricao     TEXT,
  quantidade    NUMERIC NOT NULL DEFAULT 1,
  unidade       TEXT NOT NULL DEFAULT 'un',
  status        TEXT NOT NULL DEFAULT 'ativo',
  criado_por    UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em     TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária automática |
| `nome` | TEXT | Nome do produto |
| `descricao` | TEXT | Descrição ou marca |
| `quantidade` | NUMERIC | Quantidade desejada |
| `unidade` | TEXT | `kg`, `un`, `L`, `g`, `cx` |
| `status` | TEXT | `ativo`, `comprado`, `removido` |
| `criado_por` | UUID | FK → `usuarios.id` |
| `criado_em` | TIMESTAMP | Data de criação |
| `atualizado_em` | TIMESTAMP | Última atualização |

#### Status dos Produtos

| Status | Descrição |
|---|---|
| `ativo` | Na lista, não comprado |
| `comprado` | Já comprado |
| `removido` | Soft delete — não aparece na listagem |

> 💡 **Soft delete** — o produto nunca é deletado do banco, apenas o status
> muda para `removido`. Isso preserva o histórico!

---

## 🔒 Middlewares

### `src/middleware/auth.js`

```js
import jwt from "jsonwebtoken"

export function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]
  // Authorization: Bearer <token>
  //                        ↑ pega só o token

  if (!token) {
    return res.status(401).json({ mensagem: "Token não fornecido!" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded  // disponível em todas as rotas protegidas
    next()              // passa para a próxima função
  } catch (erro) {
    return res.status(401).json({ mensagem: "Token inválido ou expirado!" })
  }
}
```

#### Como o `next()` funciona

```
requisição → autenticarToken() → rota() → resposta
                    ↑
     token válido → chama next() → vai para a rota
     token inválido → retorna 401 → para aqui
```

#### Acessando o usuário nas rotas

```js
router.get("/", autenticarToken, async (req, res) => {
  const usuarioID = req.user.id     // ID do usuário logado
  const email = req.user.email      // email do usuário logado
})
```

---

## 🔧 Serviços

### `src/servicos/servico_usuario.js`

```js
// Criar usuário com senha criptografada
export async function criarUsuario(nome, email, senha) {
  const senhaCriptografada = await bcrypt.hash(senha, 10)
  const { data, error } = await supabase
    .from("usuarios")
    .insert([{ nome, email, senha: senhaCriptografada }])
    .select("id, nome, email")  // nunca retorna a senha!
    .single()
  if (error) throw error
  return data
}

// Buscar usuário por email
export async function buscarUsuarioPorEmail(email) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .single()
  if (error) return null
  return data
}
```

### `src/servicos/servico_autenticacao.js`

```js
export async function autenticar(email, senha) {
  // 1. busca usuário
  const usuario = await buscarUsuarioPorEmail(email)
  if (!usuario) return { status: false, mensagem: "E-mail ou senha incorretos!" }

  // 2. compara senha com hash
  const senhaValida = await bcrypt.compare(senha, usuario.senha)
  if (!senhaValida) return { status: false, mensagem: "E-mail ou senha incorretos!" }

  // 3. gera token JWT
  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  return { status: true, token, usuario: { id, nome, email } }
}
```

> 💡 Mesmo erro para email e senha incorretos — não revela qual está errado!

### `src/servicos/servico_produto.js`

```js
// Listar — exclui removidos, ordena por mais recente
export async function listarProdutos(usuarioID) {
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .eq("criado_por", usuarioID)
    .neq("status", "removido")        // exclui removidos
    .order("criado_em", { ascending: false })  // mais recentes primeiro
  return data
}

// Soft delete — muda status para "removido"
export async function removerProduto(id, usuarioID) {
  await supabase
    .from("produtos")
    .update({ status: "removido", atualizado_em: new Date() })
    .eq("id", id)
    .eq("criado_por", usuarioID)  // garante que só remove o próprio produto!
}
```

---

## ✅ Validações

### `src/validacao/valida_usuario.js`

```js
export function validarUsuario(nome, email, senha) {
  if (!nome || nome.trim() === "")
    return { status: false, mensagem: "Nome é obrigatório!" }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailValido)
    return { status: false, mensagem: "E-mail inválido!" }

  if (senha.length < 6)
    return { status: false, mensagem: "Senha deve ter no mínimo 6 caracteres!" }

  return { status: true }
}
```

### `src/validacao/valida_produto.js`

```js
export function validarProduto(nome, quantidade, unidade) {
  if (!nome || nome.trim() === "")
    return { status: false, mensagem: "Nome do produto é obrigatório!" }

  if (!quantidade || quantidade <= 0)
    return { status: false, mensagem: "Quantidade deve ser maior que zero!" }

  const unidadesValidas = ["kg", "un", "L", "g", "cx"]
  if (!unidadesValidas.includes(unidade))
    return { status: false, mensagem: "Unidade inválida!" }

  return { status: true }
}

export function validarStatus(status) {
  const statusValidos = ["ativo", "comprado"]
  if (!statusValidos.includes(status))
    return { status: false, mensagem: "Status inválido!" }
  return { status: true }
}
```

---

## 🛣️ Rotas

### Base URL

```
Desenvolvimento: http://localhost:8080
Produção:        https://sua-api.vercel.app
```

### `src/index.js` — Registro das rotas

```js
app.use("/usuarios", rotaUsuarios)
app.use("/login", rotaAutenticacao)
app.use("/produtos", rotaProdutos)
```

---

### 👤 Usuários

#### `POST /usuarios` — Cadastrar

**Body:**
```json
{
  "nome": "Andre Souza",
  "email": "andre@email.com",
  "senha": "123456"
}
```

**Resposta (201):**
```json
{
  "mensagem": "Usuário cadastrado com sucesso!",
  "usuario": {
    "id": "289df5fe-9487-4dc3-82a3-d688d37a4578",
    "nome": "Andre Souza",
    "email": "andre@email.com"
  }
}
```

---

### 🔐 Autenticação

#### `POST /login` — Login

**Body:**
```json
{
  "email": "andre@email.com",
  "senha": "123456"
}
```

**Resposta (200):**
```json
{
  "status": true,
  "mensagem": "Autenticação realizada com sucesso.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "289df5fe-9487-4dc3-82a3-d688d37a4578",
    "nome": "Andre Souza",
    "email": "andre@email.com"
  }
}
```

---

### 🛍️ Produtos

> Todas requerem header: `Authorization: Bearer <token>`

#### `GET /produtos` — Listar

**Resposta (200):**
```json
[
  {
    "id": "f41befd3-3593-476b-a8d8-d9abf30de06c",
    "nome": "Arroz",
    "descricao": "Tio João",
    "quantidade": 3,
    "unidade": "kg",
    "status": "ativo",
    "criado_por": "289df5fe-9487-4dc3-82a3-d688d37a4578",
    "criado_em": "2026-03-05T16:56:50.86745",
    "atualizado_em": "2026-03-05T16:56:50.86745"
  }
]
```

#### `POST /produtos` — Cadastrar

**Body:**
```json
{
  "nome": "Arroz",
  "descricao": "Tio João",
  "quantidade": 3,
  "unidade": "kg"
}
```

**Resposta (201):**
```json
{
  "mensagem": "Produto cadastrado com sucesso!",
  "produto": { ... }
}
```

> 💡 Se o produto existir com status `removido`, ele é **reativado** automaticamente!

#### `PUT /produtos/:id` — Atualizar

**Body:**
```json
{
  "nome": "Arroz",
  "descricao": "Tio João Tipo 1",
  "quantidade": 5,
  "unidade": "kg"
}
```

**Resposta (200):**
```json
{ "mensagem": "Produto atualizado com sucesso!" }
```

#### `PATCH /produtos/:id` — Atualizar status

**Body:**
```json
{ "status": "comprado" }
```

**Status aceitos:** `ativo` | `comprado`

**Resposta (200):**
```json
{ "mensagem": "Status atualizado com sucesso!" }
```

#### `DELETE /produtos/:id` — Remover

**Resposta (200):**
```json
{ "mensagem": "Produto removido com sucesso!" }
```

> 💡 Soft delete — status muda para `removido`, não apaga do banco!

---

## 🔐 Autenticação JWT

### Fluxo completo

```
1. POST /login com email e senha
2. API valida credenciais com bcrypt
3. API gera token JWT com { id, nome, email }
4. Frontend guarda token no localStorage
5. Frontend envia token em toda requisição:
   Authorization: Bearer <token>
6. Middleware valida o token
7. req.user fica disponível na rota
```

### Payload do token

```json
{
  "id": "289df5fe-9487-4dc3-82a3-d688d37a4578",
  "nome": "Andre Souza",
  "email": "andre@email.com",
  "iat": 1772730056,
  "exp": 1773334856
}
```

---

## 🧪 Testando com Postman

### Dicas importantes

```
✅ Método (GET, POST...) → selecionar no dropdown
✅ URL → só a URL, sem escrever o método
✅ Header Authorization → Key: Authorization | Value: Bearer <token>
✅ Body → raw → JSON
```

### Ordem de testes

```
1. POST /usuarios     → cadastrar usuário
2. POST /login        → pegar token
3. POST /produtos     → cadastrar produto (com token)
4. GET  /produtos     → listar produtos (com token)
5. PATCH /produtos/:id → marcar comprado (com token)
6. DELETE /produtos/:id → remover produto (com token)
```

---

## 🚨 Códigos de Erro

| Código | Descrição |
|---|---|
| `200` | Sucesso |
| `201` | Criado com sucesso |
| `400` | Dados inválidos |
| `401` | Não autenticado / Token inválido |
| `404` | Não encontrado |
| `500` | Erro interno do servidor |

---

## ▶️ Como Rodar

```bash
# Instalar dependências
npm install

# Desenvolvimento (hot reload)
npm run dev

# Produção
npm start
```

---

*Documentação atualizada em 05/03/2026 🚀*
