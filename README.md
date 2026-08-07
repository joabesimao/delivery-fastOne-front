# 📦 FastOne Delivery - Frontend

<div align="center">

![version](https://img.shields.io/badge/version-1.0.0-0ea5e9.svg?style=flat-square)
![react](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=flat-square)
![typescript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white&style=flat-square)
![vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white&style=flat-square)
![mui](https://img.shields.io/badge/Material--UI-6.x-007FFF?logo=mui&logoColor=white&style=flat-square)

Aplicação web moderna e responsiva para gerenciamento de entregas, com cadastro de clientes, criação de pedidos, impressão de folhas de entrega em PDF e dashboard com métricas em tempo real.

[Features](#-features) • [Requisitos](#-requisitos) • [Instalação](#-instalação) • [Rotas](#-rotas) • [Estrutura](#-estrutura-do-projeto) • [Docker](#-docker)

</div>

---

## 🎯 Features

- ✅ **Dashboard em Tempo Real** - Métricas e visão geral operacional
- ✅ **Cadastro de Clientes** - Formulário completo com endereço
- ✅ **Criação de Pedidos** - Interface intuitiva com pré-preenchimento
- ✅ **Geração de PDF** - Folha de entrega em múltiplos formatos (A4, 80mm, 58mm)
- ✅ **Autenticação JWT** - Login seguro com tokens
- ✅ **Chat em Tempo Real** - WebSocket para comunicação entre filiais
- ✅ **Relatórios** - Análise de entregas e ranking de entregadores
- ✅ **Modo Dark/Light** - Tema adaptável
- ✅ **Responsivo** - Funciona em desktop, tablet e mobile
- ✅ **Offline Ready** - Algumas funcionalidades funcionam offline
- ✅ **Acessibilidade** - Conforme padrões WCAG

---

## 📋 Requisitos

- **Node.js** 20+
- **npm** 10+
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)

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
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Database (referência, não usado pelo frontend)
VITE_DB_NAME=CadClient
VITE_DB_HOST=localhost
VITE_DB_PORT=3306

# Auth - Default credentials for demo
VITE_DEFAULT_LOGIN=admin
VITE_DEFAULT_PASSWORD=12345678

# Company Information
VITE_DELIVERY_COMPANY_NAME=FastOne Delivery
VITE_DELIVERY_COMPANY_DOCUMENT=00.000.000/0001-00

# Print Settings (a4, thermal80, thermal58)
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
- `/dashboard/relatorios` - Relatórios de entregas
- `/dashboard/clientes` - Listagem de clientes
- `/relatorios-entregas` - Análise geral de entregas
- `/relatorios-entregas/entregadores` - Ranking de entregadores

### Entregas
- `/realizar-entrega` - Criar novo pedido de entrega
- `/finalizar-entrega` - Marcar entrega como completa
- `/listagem-entregas` - Listar todas as entregas

### Cadastros
- `/cadastros/cliente` - Cadastrar novo cliente
- `/cadastros/entregador` - Cadastrar novo entregador
- `/cadastros/cidades` - Gerenciar cidades
- `/cadastros/bairros` - Gerenciar bairros

### Outros
- `/configuracoes/visuais` - Personalizar tema e aparência
- `/chat` - Chat em tempo real entre filiais

---

## 📁 Estrutura do Projeto

```
src/
├── components/              # Componentes reutilizáveis
│   ├── layout/             # Layout principal (AppShell)
│   ├── forms/              # Componentes de formulário
│   └── chat/               # Componentes de chat
├── modules/                # Páginas e módulos
│   ├── dashboard/          # Dashboard e relatórios
│   ├── entregas/           # Gestão de entregas
│   ├── cadastros/          # Cadastros (clientes, etc)
│   ├── auth/               # Autenticação
│   ├── chat/               # Chat
│   └── configuracoes/      # Configurações
├── services/               # Serviços (API, WebSocket)
│   └── api.ts             # Cliente Axios
├── helpers/                # Funções utilitárias
│   ├── masks.ts           # Máscaras de input
│   └── exportHtmlToPdf.ts # Geração de PDF
├── hooks/                  # React Hooks customizados
├── context/                # Context API
├── theme/                  # Configuração de tema
├── App.tsx                 # Componente principal
└── main.tsx                # Entrada da aplicação
```

---

## 🔑 Credenciais Padrão (Demo)

Para fins de teste e demonstração, as credenciais abaixo estão configuradas no `.env`:

```
Email: admin
Senha: 12345678
```

**⚠️ Altere estas credenciais em produção!**

---

## 🎨 Tema e Personalização

### Alternar Tema

O aplicativo suporta tema claro e escuro. Clique no ícone de sol/lua no cabeçalho para alternar.

### Cores Principais

- **Primária**: `#4361EE` (Roxo)
- **Secundária**: `#0ea5e9` (Azul ciano)
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
2. Entra com email e senha
3. Backend retorna `accessToken` e `refreshToken`
4. Tokens são armazenados no `localStorage`
5. Requisições incluem `Authorization: Bearer <token>`

### Renovação de Token

Quando o `accessToken` expira:
1. Frontend detecta erro 401
2. Faz requisição com `refreshToken`
3. Recebe novo `accessToken`
4. Continua operação

---

## 🌐 Comunicação em Tempo Real

O chat utiliza WebSocket para comunicação entre filiais:

```typescript
// Conexão automática
const socket = new WebSocket('ws://localhost:3000/chat');

// Evento ao conectar
socket.onopen = () => {
  console.log('Conectado ao chat');
};

// Enviar mensagem
socket.send(JSON.stringify({
  type: 'message',
  text: 'Olá pessoal!',
  timestamp: Date.now()
}));
```

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
docker build -f Dockerfile.public -t fastone-frontend:latest .
```

### Executar com Docker Compose

```bash
docker-compose -f docker-compose.public.yml up -d
```

O frontend estará em `http://localhost:5173`

---

## 🧪 Testes

### Executar testes (quando implementados)

```bash
npm run test
```

### Cobertura

```bash
npm run test:coverage
```

---

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                 # Inicia servidor de desenvolvimento com HMR

# Build
npm run build              # Compila para produção em dist/
npm run preview            # Visualiza a build de produção localmente

# Linting
npm run lint               # Verifica código com ESLint

# Análise
npm run type-check         # Verifica tipos TypeScript
```

---

## 🔗 Integração com Backend

A aplicação se conecta à API em:

```
VITE_API_BASE_URL/api
```

Exemplos de endpoints utilizados:

```
POST   /api/login              # Login
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

- ✅ Autenticação JWT
- ✅ Tokens armazenados seguramente
- ✅ Validação de entrada em formulários
- ✅ Sanitização de dados
- ✅ CORS configurado
- ✅ Headers de segurança

---

## 📈 Performance

- ⚡ Build otimizado com Vite
- ⚡ Code splitting automático
- ⚡ Lazy loading de rotas
- ⚡ Compressão de assets
- ⚡ Caching de requisições

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Abra uma issue no repositório
2. Verifique se há issues similares já abertas
3. Descreva o problema em detalhes

---

<div align="center">

**Desenvolvido com ❤️ by FastOne Delivery Team**

[⬆ Voltar ao topo](#-fastone-delivery---frontend)

</div>
```

Aplicacao em: http://localhost:5173

## Variaveis de ambiente

Arquivo de exemplo: .env.public.example

- VITE_API_BASE_URL: URL base da API.
- VITE_DEFAULT_LOGIN: login inicial sugerido na tela.
- VITE_DEFAULT_PASSWORD: senha inicial sugerida na tela.
- VITE_DELIVERY_COMPANY_NAME: nome da empresa na folha de entrega.
- VITE_DELIVERY_COMPANY_DOCUMENT: documento exibido na folha (ex.: CNPJ).
- VITE_DELIVERY_SHEET_FORMAT: formato padrao da folha (a4, thermal80, thermal58).

## Docker publico (frontend)

Este projeto inclui Dockerfile publico para publicacao.

Build da imagem:

```bash
docker build -f Dockerfile.public -t fastone-front:public .
```

Run:

```bash
docker run --rm -p 5173:80 fastone-front:public
```

## Scripts

- npm run dev: servidor de desenvolvimento.
- npm run build: build de producao.
- npm run preview: preview do build.
- npm run lint: verificacao de lint.

## Publicacao Full Stack

Para subir frontend + API + MySQL com um comando, use o compose publico do backend em:

- ../nodejs-backend-delivery-manager/docker-compose.public.yml

## Licenca

Uso interno/projeto privado. Adapte conforme politica do seu repositorio publico.
