# Delivery FastOne Frontend

![versao](https://img.shields.io/badge/version-1.0.0-0ea5e9.svg)
![react](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white)

Aplicacao web para operacao de entregas, com cadastro e gerenciamento de pedidos, impressao de folha de entrega em PDF e interface otimizada para uso diario.

## Destaques

- Fluxo de criar pedido integrado com emissao de folha de entrega em PDF.
- Opcao para imprimir direto ou abrir janela de salvar/imprimir manualmente.
- Formatos de folha: A4, termica 80mm e termica 58mm.
- Login com token e refresh token.
- Interface modular com React + MUI.

## Stack

- React 19
- TypeScript
- Vite
- Material UI
- Axios
- Formik
- html2canvas + jsPDF

## Requisitos

- Node.js 20+
- npm 10+

## Execucao local (sem Docker)

1. Instale dependencias:

```bash
npm install
```

2. Crie o arquivo de ambiente local a partir do modelo publico:

```bash
cp .env.public.example .env
```

3. Rode em desenvolvimento:

```bash
npm run dev
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
