# Product Management API

API REST desenvolvida com **Node.js, Express, TypeScript, PostgreSQL e Prisma**, com foco em autenticação segura baseada em sessões, organização profissional por camadas e boas práticas de segurança.

O projeto foi construído com finalidade de estudo e evolução para um sistema com CRUD protegido, auditoria de usuários e controle de acesso.

## Tecnologias

- Node.js
- Express 5
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod
- Argon2id
- express-session
- connect-pg-simple
- Helmet
- CORS
- express-rate-limit

## Arquitetura

A aplicação segue uma separação de responsabilidades por camadas:

```text
request
   ↓
route
   ↓
middlewares
   ↓
controller
   ↓
service
   ↓
repository
   ↓
prisma
   ↓
postgresql
```

Responsabilidades principais:

```text
routes
→ definição dos endpoints

middlewares
→ autenticação, segurança, csrf, rate limiting e tratamento de erros

controllers
→ entrada e saída http

services
→ regras de negócio

repositories
→ acesso e persistência no banco

prisma
→ orm e gerenciamento do schema

postgresql
→ persistência dos dados
```

## Estrutura

```text
.
├── prisma/
│   ├── migrations/
│   ├── models/
│   │   ├── product.prisma
│   │   └── user.prisma
│   └── schema.prisma
│
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   ├── prisma.ts
│   │   └── session.ts
│   │
│   ├── generated/
│   │   └── prisma/
│   │
│   ├── middlewares/
│   │   ├── auth-rate-limit.middleware.ts
│   │   ├── csrf.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── require-auth.middleware.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── auth.service.ts
│   │   │
│   │   └── users/
│   │       └── user.repository.ts
│   │
│   ├── shared/
│   │   ├── errors/
│   │   │   └── app-error.ts
│   │   └── security/
│   │       ├── csrf.ts
│   │       └── password.ts
│   │
│   ├── types/
│   │   └── express-session.d.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── prisma.config.ts
└── tsconfig.json
```

## Autenticação

A autenticação utiliza **sessões armazenadas no PostgreSQL**.

Fluxo:

```text
email + password
       ↓
validação com zod
       ↓
busca do usuário
       ↓
argon2id verifica senha
       ↓
sessão regenerada
       ↓
userId salvo na sessão
       ↓
sessão salva no postgresql
       ↓
cookie httpOnly enviado ao cliente
```

O cookie contém apenas o identificador da sessão.

Os dados da sessão ficam no servidor:

```text
session
├── sid
├── sess
│   ├── userId
│   └── csrfToken
└── expire
```

## Endpoints de autenticação

```http
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/logout
GET  /auth/csrf-token
```

### Register

```http
POST /auth/register
```

Exemplo:

```json
{
  "name": "Pedro",
  "email": "pedro@example.com",
  "password": "SenhaForte123!"
}
```

Fluxo:

```text
request
↓
registerSchema
↓
registerController
↓
registerService
↓
verificação de email
↓
argon2id
↓
userRepository
↓
prisma
↓
postgresql
```

A senha original nunca é armazenada.

## Password hashing

As senhas são protegidas utilizando **Argon2id**.

```text
password
↓
argon2id
↓
passwordHash
↓
postgresql
```

Durante o login:

```text
password enviada
+
passwordHash armazenado
↓
argon2.verify()
↓
true / false
```

Também é utilizado um hash fictício durante tentativas com email inexistente para reduzir diferenças de tempo que poderiam ajudar na enumeração de usuários.

## Sessões

As sessões são gerenciadas por:

```text
express-session
+
connect-pg-simple
+
postgresql
```

O servidor salva:

```ts
req.session.userId
```

após autenticação válida.

No login, a sessão é regenerada antes de associar o usuário:

```text
sessão anterior
↓
regenerate()
↓
novo session id
↓
userId
↓
csrfToken
```

Isso reduz riscos de **session fixation**.

## Cookies

Configuração principal:

```text
httpOnly
→ impede leitura do cookie pelo javascript do navegador

sameSite
→ reduz envio indevido entre sites

secure
→ habilitado em produção para exigir https

maxAge
→ define o tempo de vida do cookie
```

O cookie e a sessão possuem controle de expiração.

## CSRF

A API utiliza proteção CSRF baseada em token armazenado na sessão.

Fluxo:

```text
GET /auth/csrf-token
↓
cliente recebe csrfToken

requisição protegida
↓
X-CSRF-Token
↓
csrfProtection
↓
comparação com session.csrfToken
```

Exemplo:

```http
X-CSRF-Token: token-gerado-pelo-servidor
```

Operações autenticadas que alteram estado podem exigir:

```text
requireAuth
+
csrfProtection
```

## Rate limiting

As rotas de autenticação possuem limites independentes.

Exemplo:

```text
login
→ proteção contra brute force

register
→ proteção contra criação abusiva de contas
```

Quando o limite é excedido:

```http
429 Too Many Requests
```

## Segurança

A aplicação implementa atualmente:

- Argon2id para armazenamento de senhas
- sessões persistentes no PostgreSQL
- regeneração de sessão após login
- cookies `HttpOnly`
- cookies `Secure` em produção
- `SameSite`
- proteção CSRF
- rate limiting
- validação de entrada com Zod
- Helmet
- CORS restritivo
- tratamento global de erros
- mensagens genéricas no login
- redução de enumeração de usuários
- variáveis de ambiente validadas
- remoção de `X-Powered-By`
- middleware de autenticação

## Autorização

Rotas privadas utilizam:

```text
requireAuth
```

Fluxo:

```text
request
↓
sessão recuperada
↓
req.session.userId existe?
├── não → 401
└── sim → next()
```

Autenticação responde:

> quem é o usuário?

A autorização do CRUD será responsável por responder:

> esse usuário pode realizar esta ação?

## Banco de dados

O projeto utiliza PostgreSQL.

Exemplo de conexão:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/database"
```

Caracteres especiais na senha devem utilizar URL encoding.

Exemplo:

```text
# → %23
```

## Prisma

O Prisma é utilizado para:

- definição dos models
- migrations
- Prisma Client
- acesso tipado ao banco

O schema está dividido em múltiplos arquivos:

```text
prisma/
├── schema.prisma
└── models/
    ├── user.prisma
    └── product.prisma
```

O `prisma.config.ts` aponta para:

```ts
schema: "prisma"
```

### Comandos principais

Validar schema:

```bash
npx prisma validate
```

Formatar:

```bash
npx prisma format
```

Criar migration:

```bash
npx prisma migrate dev --name nome_da_migration
```

Gerar Prisma Client:

```bash
npx prisma generate
```

Status das migrations:

```bash
npx prisma migrate status
```

Resetar banco de desenvolvimento:

```bash
npx prisma migrate reset
```

Produção:

```bash
npx prisma migrate deploy
```

## Model User

O usuário permanece registrado mesmo após deixar de utilizar o sistema.

```text
isActive = true
→ acesso permitido

isActive = false
→ usuário desativado
```

Isso preserva histórico e auditoria.

O usuário não deve ser removido apenas porque um funcionário deixou a empresa.

## Model Product

Produtos possuem informações de auditoria:

```text
createdBy
→ usuário responsável pela criação

updatedBy
→ último usuário responsável pela alteração
```

Também possuem:

```text
isActive
```

permitindo desativar produtos sem apagar seu histórico.

As relações utilizam foreign keys e índices para manter integridade e melhorar consultas.

## Variáveis de ambiente

Exemplo:

```env
NODE_ENV=development

PORT=3000

DATABASE_URL=

SESSION_SECRET=

FRONTEND_URL=
```

O arquivo real:

```text
.env
```

não deve ser enviado ao Git.

O projeto disponibiliza:

```text
.env.example
```

para documentar as variáveis necessárias.

## Ambientes

### development

```text
NODE_ENV=development
secure cookie=false
trust proxy desabilitado
banco local
```

### test

```text
NODE_ENV=test
banco separado
dados descartáveis
secure cookie=false
```

### production

```text
NODE_ENV=production
https
secure cookie=true
secrets de produção
trust proxy conforme infraestrutura
```

## Scripts

Desenvolvimento:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Produção:

```bash
npm start
```

Fluxo:

```text
development
src/*.ts
↓
tsx watch
↓
node
```

```text
production
src/*.ts
↓
tsc
↓
dist/*.js
↓
node
```

## Instalação

Clone o repositório:

```bash
git clone <repository-url>
```

Entre na pasta:

```bash
cd express-auth-api
```

Instale as dependências:

```bash
npm install
```

Crie:

```text
.env
```

usando:

```text
.env.example
```

como referência.

Gere o Prisma Client:

```bash
npx prisma generate
```

Aplique as migrations:

```bash
npx prisma migrate dev
```

Inicie:

```bash
npm run dev
```

A API ficará disponível, por padrão, em:

```text
http://localhost:3000
```

## Git

Arquivos que não devem ser versionados:

```gitignore
node_modules/
dist/
.env
src/generated/prisma/

.vscode/
.DS_Store
Thumbs.db
```

As migrations devem ser versionadas:

```text
prisma/migrations/
```

## Status

Implementado:

- estrutura Express + TypeScript
- PostgreSQL
- Prisma
- migrations
- User
- register
- login
- logout
- sessão persistente
- `/auth/me`
- Argon2id
- Zod
- tratamento de erros
- autenticação por middleware
- CSRF
- rate limiting
- Helmet
- CORS
- configuração por ambiente

Em desenvolvimento:

- CRUD de Products
- autorização por usuário
- auditoria do CRUD
- testes automatizados
- deploy
