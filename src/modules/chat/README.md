# Chat Module Documentation

## Overview
Módulo de chat moderno e responsivo para comunicação em tempo real entre lojas (matriz e filiais).

## Features
- ✅ Comunicação em tempo real via Socket.io
- ✅ Suporte a texto e imagens
- ✅ Histórico de mensagens agrupadas por data
- ✅ Busca de mensagens
- ✅ Status de conexão em tempo real
- ✅ Interface responsiva (mobile/desktop)
- ✅ Componentes modulares e reutilizáveis
- ✅ Animações suaves e transições

## Project Structure

```
src/modules/chat/
├── ChatRealtime.tsx          # Componente principal
├── chat.css                  # Estilos e animações
└── components/
    ├── index.ts              # Exportações
    ├── ChatHeader.tsx        # Cabeçalho com seletor e status
    ├── ChatMessages.tsx      # Lista de mensagens
    ├── ChatMessageItem.tsx   # Item individual de mensagem
    ├── ChatInput.tsx         # Área de entrada de mensagens
    ├── ChatSearch.tsx        # Busca de mensagens
    └── TypingIndicator.tsx   # Indicador de digitação
```

## Components

### ChatRealtime
Componente principal que gerencia o estado do chat e orquestra os subcomponentes.

**Props:**
- Nenhuma (usa context de Socket.io)

**State:**
- `messages`: Array de mensagens
- `socket`: Instância do Socket.io
- `session`: Dados da sessão do usuário
- `selectedUnitId`: ID da loja selecionada
- `isConnected`: Status de conexão
- `searchQuery`: Query de busca
- `text`: Texto da mensagem
- `imageBase64`: Imagem em base64
- `sending`: Estado de envio

### ChatHeader
Exibe informações sobre a sessão, seletor de lojas e status.

**Props:**
```typescript
interface ChatHeaderProps {
  session: RealtimeSessionReady | null;
  selectedUnitId: string;
  onUnitChange: (unitId: string) => void;
  isConnected: boolean;
  unitsCount: number;
  messagesCount: number;
  onRefresh?: () => void;
}
```

### ChatMessages
Lista de mensagens com agrupamento por data.

**Props:**
```typescript
interface ChatMessagesProps {
  messages: RealtimeChatMessage[];
  loading: boolean;
  currentUserId?: number;
  onDeleteMessage?: (messageId: number) => void;
  selectedStoreId?: string;
}
```

**Features:**
- Carregamento com skeleton
- Agrupamento por data (Hoje, Ontem, data específica)
- Scroll automático para a última mensagem
- Filtro por loja selecionada

### ChatMessageItem
Componente individual para exibir uma mensagem.

**Props:**
```typescript
interface ChatMessageItemProps {
  message: RealtimeChatMessage;
  isOwn: boolean;
  onDelete?: (messageId: number) => void;
}
```

**Features:**
- Avatar do remetente
- Informações de remetente, loja e timestamp
- Suporte a imagens
- Menu de contexto para deletar (mensagens próprias)

### ChatInput
Área de entrada com suporte a texto e imagens.

**Props:**
```typescript
interface ChatInputProps {
  disabled?: boolean;
  sending?: boolean;
  text: string;
  imageName?: string;
  hasImage: boolean;
  onTextChange: (text: string) => void;
  onImageSelect: (file: File) => void;
  onImageClear: () => void;
  onSend: () => void;
  maxMessageLength?: number;
}
```

**Features:**
- Contador de caracteres
- Preview de imagem
- Validação de arquivo (tipo e tamanho)
- Atalho Ctrl+Enter para enviar
- Feedback visual de envio

### ChatSearch
Componente de busca de mensagens.

**Props:**
```typescript
interface ChatSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}
```

**Features:**
- Busca em tempo real
- Busca por texto, remetente ou loja
- Contador de resultados

### TypingIndicator
Indicador visual de que alguém está digitando.

**Props:**
```typescript
interface TypingIndicatorProps {
  userName?: string;
}
```

## Socket Events

### Emit (Cliente → Servidor)
- `chat:send` - Envia uma mensagem
- `chat:fetch-history` - Busca histórico de mensagens

### Listen (Servidor → Cliente)
- `session:ready` - Sessão pronta, fornece dados do usuário
- `chat:history` - Histórico de mensagens
- `chat:message` - Nova mensagem recebida
- `connect_error` - Erro de conexão

## Data Models

### RealtimeSessionReady
```typescript
{
  account: {
    id: number;
    name: string;
    email: string;
    role: "principal" | "branch";
    unitStoreId: number | null;
  };
  units: Array<{
    id: number;
    name: string;
    parentStoreId: number | null;
    isMain: boolean;
  }>;
}
```

### RealtimeChatMessage
```typescript
{
  id: number;
  unitStoreId: number;
  text: string | null;
  imageBase64: string | null;
  imageMimeType: string | null;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    email: string;
    role: "principal" | "branch";
    unitStoreId: number | null;
  };
  unitStore: {
    id: number;
    name: string;
  };
}
```

## Styling

### CSS Classes
- `.chat-message-item` - Item de mensagem com animação
- `.connection-indicator` - Indicador de conexão (pulse)
- `.typing-indicator` - Indicador de digitação
- `.chat-messages-container` - Container com scroll suave

### Animações
- `fadeIn` - Fade in com slide para cima
- `slideIn` - Slide a partir da esquerda
- `pulse` - Pulsação contínua
- `typing` - Animação de digitação

## Uso

```typescript
import ChatRealtime from './modules/chat/ChatRealtime';

// Na rota
<Route path="/chat" element={<ChatRealtime />} />
```

## Melhorias Futuras
- [ ] Indicador de digitação em tempo real
- [ ] Reações às mensagens (emoji)
- [ ] Edição de mensagens enviadas
- [ ] Pinning de mensagens importantes
- [ ] Busca avançada com filtros
- [ ] Temas escuro/claro
- [ ] Notificações de novas mensagens
- [ ] Integração com desktop notifications
- [ ] Suporte a áudio/vídeo
- [ ] Compartilhamento de tela

## Performance

- Virtualization para listas grandes (pode ser adicionado)
- Debounce na busca
- Lazy loading de imagens
- Memoização de componentes

## Acessibilidade

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- High contrast support

## Browser Support

- Chrome/Edge (última versão)
- Firefox (última versão)
- Safari (última versão)
- Mobile browsers (iOS Safari, Chrome Mobile)
