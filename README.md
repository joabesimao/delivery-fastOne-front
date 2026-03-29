# 🚀 Delivery App

Um aplicativo moderno de **delivery**, construído com **React**, **TypeScript** e **Vite**, utilizando **MUI** para interface e **Emotion** para estilização. Este projeto é uma base escalável e modular para sistemas de entrega online.

---

## 📦 Tecnologias Utilizadas

- **React 19** – Biblioteca principal para construção da interface.
- **TypeScript** – Tipagem estática para maior segurança e produtividade.
- **Vite** – Ferramenta de build rápida e moderna.
- **MUI (Material UI)** – Componentes prontos e responsivos.
- **Emotion** – CSS-in-JS para estilização dinâmica.
- **ESLint** – Linting para manter o código limpo e consistente.

---

## ⚡ Scripts Disponíveis

| Script            | Descrição                                                |
| ----------------- | -------------------------------------------------------- |
| `npm run dev`     | Inicia o servidor de desenvolvimento (Vite).             |
| `npm run build`   | Compila o projeto para produção (TypeScript + Vite).     |
| `npm run preview` | Preview do build de produção.                            |
| `npm run lint`    | Verifica padrões de código e possíveis erros com ESLint. |

---

## 🛠️ Instalação

Clone o repositório e instale as dependências:

```bash
git clone <URL_DO_REPOSITORIO>
cd delivery
npm install
```

---

## 🚀 Desenvolvimento

Para rodar o projeto em modo desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.  
O Vite suporta **Hot Module Replacement (HMR)**, então alterações no código são refletidas instantaneamente.

---

## 🏗️ Estrutura do Projeto

```text
delivery/
├─ public/            # Arquivos estáticos
├─ src/
│  ├─ assets/         # Imagens, fontes e ícones
│  ├─ components/     # Componentes React reutilizáveis
│  ├─ pages/          # Páginas da aplicação
│  ├─ styles/         # Estilos globais e temas
│  ├─ App.tsx         # Componente raiz
│  └─ main.tsx        # Entrada da aplicação
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

---

## 💅 Estilização

O projeto utiliza **Emotion** e **MUI**:

- **Emotion**: Permite CSS-in-JS com componentes estilizados.
- **MUI**: Componentes prontos, responsivos e customizáveis via tema.

---

## 🧹 Linting & Qualidade de Código

- Configurado com **ESLint** para detectar problemas e manter padrões.
- Plugins utilizados: `react-hooks`, `react-refresh`, `@typescript-eslint`.

Rodar lint:

```bash
npm run lint
```

---

## 🔗 Dependências Principais

```json
"dependencies": {
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "@mui/material": "^7.3.9",
  "@mui/icons-material": "^7.3.9",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@fontsource/roboto": "^5.2.10"
}
```

---

## 📜 Contribuição

1. Fork este repositório
2. Crie uma branch com sua feature: `git checkout -b feature/nova-feature`
3. Commit suas alterações: `git commit -m 'Adicionar nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é **privado**, mas pode ser adaptado para projetos públicos conforme necessidade.
