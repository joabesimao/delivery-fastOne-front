# 📦 FastOne Delivery - Frontend

<div align="center">

![version](https://img.shields.io/badge/version-1.0.0-0ea5e9.svg?style=flat-square)
![react](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=flat-square)
![typescript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white&style=flat-square)
![vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white&style=flat-square)
![mui](https://img.shields.io/badge/Material--UI-7.x-007FFF?logo=mui&logoColor=white&style=flat-square)

Aplicação web moderna e responsiva para gerenciamento de entregas, com cadastro de clientes, criação de pedidos, impressão de folhas de entrega em PDF, gestão de usuários com controle de acesso por papel e dashboard com métricas em tempo real.

[Features](#-features) • [Requisitos](#-requisitos) • [Instalação](#-instalação) • [Rotas](#-rotas) • [Estrutura](#-estrutura-do-projeto) • [Docker](#-docker)

</div>

---

## 🎯 Features

- ✅ **Dashboard em Tempo Real** - Métricas e visão geral operacional
- ✅ **Cadastro de Clientes** - Formulário completo com endereço
- ✅ **Criação de Pedidos** - Interface intuitiva com pré-preenchimento
- ✅ **Geração de PDF** - Folha de entrega em múltiplos formatos (A4, 80mm, 58mm)
- ✅ **Autenticação JWT** - Login seguro com tokens e sessão baseada em papel (role)
- ✅ **Gestão de Usuários (RBAC)** - Tela exclusiva para admins criar, editar, ativar/desativar e remover contas
- ✅ **Chat em Tempo Real** - WebSocket para comunicação entre filiais
- ✅ **Relatórios** - Análise de entregas por bairro/cidade e ranking de entregadores
- ✅ **Modo Dark/Light** - Tema adaptável, com menu de perfil no cabeçalho
- ✅ **Responsivo** - Funciona em desktop, tablet e mobile
- ✅ **Acessibilidade** - Conforme padrões WCAG

---

## 📋 Requisitos

- **Node.js** 20+
- **npm** 10+
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)
- API do [`nodejs-backend-delivery-manager`](../nodejs-backend-delivery-manager) rodando (local ou via Docker)

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/delivery-fastOne-front.git
cd delivery-fastOne-front
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o arquivo de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:

```env
# API
VITE_API_BASE_URL=http://localhost:3000/api

# Database (somente referência do ambiente, não usado diretamente pelo front)
VITE_DB_NAME=CadClient
VITE_DB_HOST=localhost
VITE_DB_PORT=3306

# Auth
VITE_DEFAULT_LOGIN=admin
VITE_DEFAULT_PASSWORD=12345678

# Empresa
VITE_DELIVERY_COMPANY_NAME=FastOne Delivery
VITE_DELIVERY_COMPANY_DOCUMENT=00.000.000/0001-00

# Configurações de impressão (a4, thermal80, thermal58)
VITE_DELIVERY_SHEET_FORMAT=a4
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### 5. Build para produção

```bash
npm run build

# Preview da build
npm run preview
```

---

## 🗺️ Rotas

### Dashboard
- `/dashboard` - Visão geral com métricas
- `/dashboard/relatorios` - Relatórios de entregas (por bairro, cidade e situação geral)
- `/dashboard/clientes` - Listagem de clientes
- `/dashboard/produtos` - Listagem de produtos
- `/dashboard/usuarios` - Gestão de usuários **(exclusivo para o papel `admin`)**

### Entregas
- `/realizar-entrega` - Criar novo pedido de entrega
- `/finalizar-entrega` - Marcar entrega como completa
- `/listagem-entregas` - Listar todas as entregas
- `/listagem-entregadores` - Listar entregadores

### Cadastros
- `/cadastros/cidades` - Gerenciar cidades e bairros

### Outros
- `/configuracoes/visuais` - Personalizar tema e aparência
- `/chat` - Chat em tempo real entre filiais
- `/filiais` - Gestão de filiais

> Rotas marcadas por papel usam o componente `RequireAuth` com a prop `roles`, que redireciona para `/dashboard` quem não tiver a permissão necessária.

---

## 👥 Gestão de Usuários e Papéis (RBAC)

A conta autenticada carrega um `role` (papel), devolvido pelo backend no login e persistido em `localStorage` (`currentUserRole`):

| Papel | Descrição |
|---|---|
| `admin` | Acesso total, incluindo a tela de Usuários |
| `gerente_estoque` | Gestão operacional (pedidos, estoque) |
| `entregador` | Perfil operacional de entrega |
| `user` | Acesso padrão |

Somente contas `admin` veem o item **Usuários** no menu lateral e conseguem acessar `/dashboard/usuarios`, onde é possível:

- Listar usuários com busca e filtro por papel
- Criar novos usuários (`POST /account/staff`)
- Editar nome, e-mail, papel e senha (`PUT /account/:id`)
- Ativar/desativar uma conta sem excluí-la (contas inativas não conseguem fazer login)
- Remover uma conta (`DELETE /account/:id`) — o backend impede que um admin exclua a própria conta ou o último admin ativo

---

## 📁 Estrutura do Projeto

```
src/
├── components/              # Componentes reutilizáveis
│   ├── layout/             # Layout principal (AppShell: menu lateral + header)
│   ├── forms/              # Componentes de formulário
│   └── chat/               # Componentes de chat
├── modules/                # Páginas e módulos
│   ├── dashboard/          # Dashboard, relatórios e listagem de usuários
│   ├── entregas/           # Gestão de entregas
│   ├── cadastros/          # Cadastros (clientes, usuários, etc)
│   ├── auth/               # Autenticação
│   ├── chat/               # Chat
│   └── configuracoes/      # Configurações
├── services/               # Serviços (API, WebSocket)
│   └── api.ts             # Cliente Axios
├── types/                  # Tipos compartilhados (ex.: Usuario.ts)
├── helpers/                # Funções utilitárias
│   ├── masks.ts           # Máscaras de input
│   └── exportHtmlToPdf.ts # Geração de PDF
├── hooks/                  # React Hooks customizados
├── context/                # Context API
├── theme/                  # Configuração de tema
├── App.tsx                 # Componente principal
└── main.tsx                # Entrada da aplicação (rotas)
```

---

## 🔑 Credenciais Padrão (Demo)

Para fins de teste e demonstração, as credenciais abaixo estão configuradas no `.env`:

```
Login: admin
Senha: 12345678
```

**⚠️ Altere estas credenciais em produção!**

---

## 🎨 Tema e Personalização

### Alternar Tema

O aplicativo suporta tema claro e escuro. Clique no ícone de sol/lua no cabeçalho para alternar — o avatar do usuário fica ao lado desse ícone e abre o menu de perfil (nome, e-mail e "Sair").

### Cores Principais

- **Primária**: `#0ea5e9` (Azul ciano)
- **Secundária**: `#0f172a` (Navy escuro)
- **Sucesso**: `#10b981` (Verde)
- **Aviso**: `#f59e0b` (Amarelo)
- **Erro**: `#ef4444` (Vermelho)

---

## 🖨️ Impressão de Folhas de Entrega

### Formatos Suportados

1. **A4** - Padrão, folha completa
2. **Térmica 80mm** - Para impressoras térmicas
3. **Térmica 58mm** - Para impressoras de bolso

### Configuração

Defina o formato padrão na variável de ambiente:

```env
VITE_DELIVERY_SHEET_FORMAT=a4  # Opções: a4, thermal80, thermal58
```

### Uso

Ao criar um pedido:
1. Preencha os dados do cliente e do pedido
2. Clique em "Salvar"
3. Escolha entre "Abrir visualização" ou "Imprimir direto"
4. A folha será gerada em PDF

---

## 🔐 Autenticação

### Fluxo de Login

1. Usuário acessa `/login`
2. Entra com login/e-mail e senha
3. Backend valida a conta (rejeitando contas inativas) e retorna `accessToken`, `refreshToken`, `name` e `role`
4. Esses dados são armazenados no `localStorage` (`accessToken`, `refreshToken`, `currentUserEmail`, `currentUserName`, `currentUserRole`)
5. Requisições incluem `Authorization: Bearer <token>`
6. O menu lateral e as rotas restritas usam `currentUserRole` para decidir o que exibir/liberar

### Renovação de Token

Quando o `accessToken` expira:
1. Frontend detecta erro 401
2. Faz requisição com `refreshToken`
3. Recebe novo `accessToken`
4. Continua operação

Ao fazer logout (ou quando a sessão expira), todos os dados de sessão são removidos do `localStorage`.

---

## 🌐 Comunicação em Tempo Real

O chat utiliza WebSocket para comunicação entre filiais, conectado automaticamente pelo serviço em `src/services/realtime.ts` enquanto o usuário está autenticado.

---

## 📱 Responsividade

A aplicação é totalmente responsiva com breakpoints:

- **xs**: 0px - Mobile
- **sm**: 600px - Tablet pequeno
- **md**: 900px - Tablet
- **lg**: 1200px - Desktop
- **xl**: 1536px - Desktop grande

---

## 🐳 Docker

### Build da imagem

```bash
docker build -f Dockerfile.public -t fastone-front:public .
```

### Executar

```bash
docker run --rm -p 5173:80 fastone-front:public
```

### Publicação full stack (frontend + API + MySQL)

Para subir tudo com um comando, use o compose público do backend:

```bash
cd ../nodejs-backend-delivery-manager
docker-compose -f docker-compose.public.yml up -d
```

---

## 📦 Scripts Disponíveis

```bash
npm run dev       # Inicia servidor de desenvolvimento com HMR
npm run build     # Type-check (tsc -b) + build de produção em dist/
npm run preview   # Visualiza a build de produção localmente
npm run lint      # Verifica código com ESLint
```

---

## 🔗 Integração com Backend

A aplicação se conecta à API em `VITE_API_BASE_URL`. Principais endpoints utilizados:

```
POST   /api/login              # Login (retorna accessToken, refreshToken, name, role)
POST   /api/refresh-token      # Renovação de token
GET    /api/account            # Listar usuários (admin)
POST   /api/account/staff      # Criar usuário (admin)
PUT    /api/account/:id        # Atualizar usuário (admin)
DELETE /api/account/:id        # Remover usuário (admin)
GET    /api/client             # Listar clientes
POST   /api/register           # Registrar cliente
GET    /api/orderDelivery      # Listar pedidos
POST   /api/orderDelivery      # Criar pedido
GET    /api/deliveryman        # Listar entregadores
GET    /api/city               # Listar cidades
GET    /api/neighborhood       # Listar bairros
GET    /api/dashboard/overview # Métricas do dashboard
```

---

## 🔐 Segurança

- ✅ Autenticação JWT com controle de acesso por papel (RBAC)
- ✅ Tokens armazenados no `localStorage` e limpos no logout/expiração
- ✅ Validação de entrada em formulários
- ✅ CORS configurado no backend

---

## 📈 Performance

- ⚡ Build otimizado com Vite
- ⚡ Code splitting automático
- ⚡ Lazy loading de rotas
- ⚡ Compressão de assets

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Uso interno/projeto privado. Adapte conforme a política do seu repositório público.

---

<div align="center">

**Desenvolvido com ❤️ by FastOne Delivery Team**

[⬆ Voltar ao topo](#-fastone-delivery---frontend)

</div>
