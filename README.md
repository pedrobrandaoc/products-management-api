# Product & Invoice Management API

API REST desenvolvida com **Node.js, Express, TypeScript, PostgreSQL e Prisma**, com foco em autenticação segura baseada em sessões, organização profissional por camadas, controle de estoque e gestão de faturas com validação de estados.

O projeto foi construído com finalidade de estudo e evolução para um sistema completo com CRUD protegido, auditoria de usuários, transições controladas e controle de acesso.

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

A aplicação segue uma separação rigorosa de responsabilidades por camadas:

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
→ definição dos endpoints e mapeamento de rotas

middlewares
→ autenticação, segurança, csrf, rate limiting e tratamento de erros

controllers
→ recepção de requisições http, validação de schemas (Zod) e envio de respostas

services
→ aplicação de regras de negócio, transições de estado e orquestração

repositories
→ acesso direto e persistência no banco de dados via Prisma

prisma
→ orm, gerenciamento do schema e tipagem

postgresql
→ persistência relacional dos dados
```

## Estrutura do Projeto

```text
.
├── prisma/
│   ├── migrations/
│   ├── models/
│   │   ├── invoice.prisma
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
│   │   ├── invoice/
│   │   │   ├── invoice.controller.ts
│   │   │   ├── invoice.routes.ts
│   │   │   ├── invoice.schema.ts
│   │   │   ├── invoice.service.ts
│   │   │   └── invoice.repository.ts
│   │   │
│   │   └── products/
│   │       ├── product.controller.ts
│   │       ├── product.routes.ts
│   │       ├── product.schema.ts
│   │       ├── product.service.ts
│   │       └── product.repository.ts
│   │
│   ├── shared/
│   │   └── errors/
│   │       └── app-error.ts
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

O cookie contém apenas o identificador da sessão. Os dados sensíveis e o vínculo de usuário ficam armazenados de forma segura no servidor.

### Endpoints de Autenticação

```http
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/logout
GET  /auth/csrf-token
```

## Módulo de Produtos (CRUD)

O sistema conta com um CRUD completo de produtos, garantindo auditoria de criação e alteração (`createdBy`, `updatedBy`) além de controle de desativação lógica (`isActive`).

### Endpoints de Produtos

```http
POST   /products
GET    /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id
```

## Módulo de Faturas (Invoices) e Controle de Estoque

As faturas gerenciam o ciclo de vida comercial e contábil, integrando-se diretamente ao estoque dos produtos por meio de operações de incremento (`incrementStock`) e decremento (`decrementStock`).

### Estados da Fatura (`InvoiceStatus`)
- **`DRAFT` (Rascunho):** Estado inicial onde a fatura pode ser editada e seus itens ajustados.
- **`ISSUED` (Emitida):** Fatura consolidada e emitida. Uma vez emitida, não pode retornar ao estado de rascunho.
- **`CANCELLED` (Cancelada):** Fatura cancelada. Uma fatura cancelada não pode ser emitida e, ao ser cancelada, os itens associados retornam automaticamente ao estoque da empresa (`incrementStock`).

### Endpoints de Faturas

```http
POST   /invoice
GET    /invoice
GET    /invoice/:id
PATCH  /invoice/:id/issue
PATCH  /invoice/:id/cancel
```

## Segurança

A aplicação implementa um conjunto robusto de práticas defensivas:

- **Argon2id:** Armazenamento seguro de senhas.
- **Sessões Persistentes:** Gerenciadas no PostgreSQL com regeneração pós-login (mitigação de *session fixation*).
- **Cookies Seguros:** `HttpOnly`, `Secure` (em produção) e políticas rígidas de `SameSite`.
- **Proteção CSRF:** Baseada em tokens validados por sessão para mutações de estado.
- **Rate Limiting:** Limites independentes em rotas críticas para evitar ataques de força bruta.
- **Validação Estrita:** Validação de payload de entrada e parâmetros de rota utilizando **Zod**.
- **Headers de Segurança:** Implementação via **Helmet** e CORS restritivo.
- **Tratamento Global de Erros:** Respostas padronizadas sem exposição de rastros internos do servidor (`AppError`).

## Banco de Dados & Prisma

O projeto utiliza **PostgreSQL** em conjunto com o **Prisma ORM**. O schema do banco é modularizado na pasta `prisma/models/`, separando as entidades `User`, `Product` e `Invoice`.

### Comandos úteis do Prisma

Validar schema:
```bash
npx prisma validate
```

Gerar Prisma Client:
```bash
npx prisma generate
```

Executar migrações em desenvolvimento:
```bash
npx prisma migrate dev
```

Deploy de migrações em produção:
```bash
npx prisma migrate deploy
```

## Instalação e Execução

Clone o repositório:
```bash
git clone <repository-url>
cd <project-folder>
```

Instale as dependências:
```bash
npm install
```

Configure as variáveis de ambiente baseando-se no arquivo de exemplo:
```bash
cp .env.example .env
```
*(Preencha a variável `DATABASE_URL` e as demais chaves no arquivo `.env`)*

Gere o Prisma Client e execute as migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

Inicie o servidor em modo de desenvolvimento:
```bash
npm run dev
```

A API estará rodando por padrão em `http://localhost:3000`.
