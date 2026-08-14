# Wallet Clean Architecture

Projeto de estudos: uma API REST de carteira digital (wallet) construída em **NestJS + TypeScript**, aplicando os princípios de **Clean Architecture** para separar regras de negócio de detalhes de infraestrutura (framework, banco de dados, HTTP).

O objetivo não é entregar um produto completo, e sim demonstrar a organização em camadas, inversão de dependência e isolamento do domínio em um contexto prático: uma carteira que permite criar contas, depositar, sacar e transferir saldo entre contas.

> 🚧 Documentação da API via Swagger ainda não implementada — está no roadmap.

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Stack técnica](#stack-técnica)
- [Domínio: regras de negócio](#domínio-regras-de-negócio)
- [Endpoints da API](#endpoints-da-api)
- [Como rodar o projeto](#como-rodar-o-projeto)
- [Testes](#testes)
- [Limitações conhecidas / roadmap](#limitações-conhecidas--roadmap)
- [Licença](#licença)

## Sobre o projeto

A aplicação modela uma carteira digital simples (`Account`), com saldo armazenado em **centavos** (inteiros) para evitar problemas de ponto flutuante. As operações suportadas são:

- Criar uma conta
- Depositar em uma conta
- Sacar de uma conta
- Transferir saldo entre duas contas

Cada regra de negócio (valor inválido, saldo insuficiente, conta não encontrada, transferência para a própria conta) é modelada como uma exceção de domínio explícita, sem depender de nada do NestJS.

## Arquitetura

O projeto segue a divisão clássica de **Clean Architecture** em quatro camadas, com a regra de dependência sempre apontando para dentro (infraestrutura e apresentação dependem do domínio, nunca o contrário):

```
src/
├── domain/account/                       # Regras de negócio puras (sem NestJS, sem TypeORM)
│   ├── entities/account.entity.ts        # Entidade Account: cria, deposita, saca, valida
│   ├── repositories/account.repository.ts# Interface do repositório (porta de saída)
│   └── exceptions/                       # Exceções de domínio
│
├── application/account/use-cases/        # Casos de uso (orquestram o domínio)
│   ├── create-account.use-case.ts
│   ├── deposit.use-case.ts
│   ├── withdraw.use-case.ts
│   └── transfer.use-case.ts
│
├── infrastructure/database/typeorm/      # Implementação de persistência (adapter)
│   ├── entities/account.orm-entity.ts    # Mapeamento TypeORM da tabela `accounts`
│   └── repositories/typeorm-account.repository.ts # Implementa AccountRepository
│
├── presentation/account/                 # Camada HTTP (NestJS)
│   ├── controllers/account.controller.ts
│   ├── dtos/                             # Validação de entrada (class-validator)
│   └── filters/domain-exception.filter.ts# Traduz exceções de domínio em respostas HTTP
│
├── account.module.ts                     # Módulo Nest: injeta use cases, repositório e controller
├── app.module.ts                         # Módulo raiz: ConfigModule + TypeOrmModule
└── main.ts                               # Bootstrap da aplicação + ValidationPipe global
```

**Como as camadas se conectam:**

1. O `AccountController` (presentation) recebe a requisição HTTP, valida o DTO e chama um caso de uso.
2. O caso de uso (application) orquestra a regra de negócio, falando apenas com a interface `AccountRepository` (domain) — nunca com TypeORM diretamente.
3. A entidade `Account` (domain) concentra as invariantes de negócio (ex: não permitir depósito com valor negativo, não permitir saque maior que o saldo).
4. O `TypeOrmAccountRepository` (infrastructure) implementa a interface do domínio, convertendo entre a entidade de domínio e a entidade ORM.
5. Erros de domínio sobem como exceções simples (`Error`), que o `DomainExceptionFilter` (presentation) intercepta e traduz para o status HTTP correto.

Essa inversão de dependência via interface (`AccountRepository`) é o que permite trocar o TypeORM/Postgres por qualquer outro mecanismo de persistência sem tocar em domínio ou casos de uso.

## Stack técnica

| Categoria | Tecnologia |
|---|---|
| Linguagem | TypeScript 5 |
| Framework | NestJS 11 |
| Banco de dados | PostgreSQL 16 |
| ORM | TypeORM (via `@nestjs/typeorm`) |
| Validação | class-validator / class-transformer |
| Testes | Jest + Supertest |
| Lint / formatação | ESLint (flat config) + Prettier |
| Containerização | Docker Compose (Postgres) |

## Domínio: regras de negócio

A entidade `Account` concentra as invariantes da carteira:

- **Criação**: toda conta nasce com saldo zero e um `id` (UUID).
- **Depósito**: o valor precisa ser um inteiro positivo (`amountInCents > 0`); caso contrário, lança `InvalidAmountException`.
- **Saque**: além de validar o valor, verifica se há saldo suficiente; caso contrário, lança `InsufficientFundsException`.
- **Transferência**: impede transferir uma conta para ela mesma (`EqualAccountsException`), busca origem e destino, saca da origem e deposita no destino.
- **Conta inexistente**: qualquer operação sobre um `id` que não existe lança `ResourceNotFoundException`.

Essas exceções são classes simples de domínio (sem depender do `HttpException` do Nest) e são traduzidas para códigos HTTP pelo `DomainExceptionFilter`:

| Exceção de domínio | Status HTTP |
|---|---|
| `InvalidAmountException` | 400 Bad Request |
| `EqualAccountsException` | 400 Bad Request |
| `ResourceNotFoundException` | 404 Not Found |
| `InsufficientFundsException` | 422 Unprocessable Entity |

## Endpoints da API

Todas as rotas estão sob o prefixo `/accounts`.

### Criar conta

```
POST /accounts
Content-Type: application/json

{
  "ownerName": "Jane Doe"
}
```

**Resposta 201**
```json
{
  "id": "b3f1c2a0-...-uuid",
  "ownerName": "Jane Doe",
  "balanceInCents": 0
}
```

### Depositar

```
POST /accounts/:id/deposit
Content-Type: application/json

{
  "amountInCents": 10000
}
```

**Resposta 200**
```json
{
  "accountId": "b3f1c2a0-...-uuid",
  "newBalanceInCents": 10000
}
```

### Sacar

```
POST /accounts/:id/withdraw
Content-Type: application/json

{
  "amountInCents": 5000
}
```

**Resposta 200**
```json
{
  "accountId": "b3f1c2a0-...-uuid",
  "newBalanceInCents": 5000
}
```

### Transferir entre contas

```
POST /accounts/:id/transfer
Content-Type: application/json

{
  "toAccountId": "outro-uuid-de-conta",
  "amountInCents": 2500
}
```

**Resposta 200**
```json
{
  "fromAccountId": "b3f1c2a0-...-uuid",
  "fromAccountNewBalanceInCents": 2500,
  "toAccountId": "outro-uuid-de-conta",
  "toAccountNewBalanceInCents": 2500
}
```

Todos os DTOs de entrada são validados globalmente via `ValidationPipe` (`whitelist`, `forbidNonWhitelisted` e `transform` habilitados), então campos não esperados no corpo da requisição são rejeitados com `400 Bad Request`.

## Como rodar o projeto

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose (para o PostgreSQL)

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd wallet-clean-arch
npm install
```

### 2. Configurar variáveis de ambiente

Copie o `.env.example` para `.env` e ajuste se necessário:

```bash
cp .env.example .env
```

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=wallet_user
DATABASE_PASSWORD=wallet_pass
DATABASE_NAME=wallet_db

PORT=3000
```

### 3. Subir o banco de dados

```bash
docker-compose up -d
```

Isso sobe um container PostgreSQL 16 na porta `5432`, com os dados persistidos em um volume Docker.

### 4. Rodar a aplicação

```bash
# modo desenvolvimento (watch)
npm run start:dev

# modo padrão
npm run start

# build + produção
npm run build
npm run start:prod
```

A API sobe em `http://localhost:3000` por padrão. O schema do banco é sincronizado automaticamente pelo TypeORM (`synchronize: true`) — não há migrations neste projeto de estudo.

## Testes

```bash
npm run test        # testes unitários
npm run test:e2e    # testes end-to-end
npm run test:cov    # cobertura de testes
```

> ⚠️ A suíte de testes automatizados ainda não foi escrita — os scripts estão configurados, mas é um dos próximos passos do projeto (ver roadmap abaixo).

## Limitações conhecidas / roadmap

Este é um projeto de estudo, então algumas decisões foram feitas conscientemente para focar no aprendizado de Clean Architecture, e ficam registradas aqui como próximos passos:

- [ ] Documentação da API via Swagger/OpenAPI
- [ ] Testes unitários (domínio e use cases) e e2e (controllers)
- [ ] Endpoints de consulta (`GET /accounts/:id`, `GET /accounts`)
- [ ] Transferência entre contas dentro de uma transação de banco (atualmente são dois `save()` separados)
- [ ] Migrations do TypeORM em vez de `synchronize: true` (adequado para estudo, não para produção)
- [ ] Autenticação/autorização

## Licença

Projeto de estudo, sem licença definida (`UNLICENSED`) — sinta-se à vontade para usar como referência de aprendizado.
