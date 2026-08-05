# 📚 Chat Module - Quick Reference

## 🚀 Quick Start

### Importar e Usar
```typescript
import ChatRealtime from '@/modules/chat/ChatRealtime';

<Route path="/chat" element={<ChatRealtime />} />
```

## 📦 Estrutura Rápida

| Pasta | Conteúdo | Responsabilidade |
|-------|----------|------------------|
| `components/` | 6 componentes React | UI dos elementos |
| `hooks/` | 2 hooks customizados | Lógica e estado |
| `*.css` | Estilos e animações | Visual e UX |
| `*.md` | Documentação | Guias e referências |

## 🎯 Componentes Principais

| Componente | Uso | Props Principais |
|-----------|-----|-----------------|
| **ChatRealtime** | Página completa | Nenhuma (usa context) |
| **ChatHeader** | Info + Seletor | session, selectedUnitId, onUnitChange |
| **ChatMessages** | Lista de mensagens | messages, loading, currentUserId |
| **ChatInput** | Campo de entrada | text, onTextChange, onSend |
| **ChatSearch** | Busca | onSearch |
| **ChatMessageItem** | Item individual | message, isOwn |
| **TypingIndicator** | Digitando... | userName |

## 🎣 Hooks Customizados

### useChat
```typescript
const { 
  messages, 
  sendMessage, 
  isConnected, 
  error 
} = useChat({
  onError: (err) => console.error(err),
  onSuccess: (msg) => console.log(msg),
});

// Enviar mensagem
await sendMessage(text, imageBase64, mimetype, unitId);
```

### useMessageFilter
```typescript
const { filtered, groupedByDate, stats } = useMessageFilter(
  messages,
  {
    searchQuery: 'importante',
    unitStoreId: 1,
    dateFrom: new Date(),
  }
);
```

## 🔗 Socket Events

### Emit
```typescript
socket.emit('chat:send', {
  text: string,
  imageBase64?: string,
  imageMimeType?: string,
  unitStoreId?: number,
}, (response) => {});

socket.emit('chat:fetch-history');
```

### Listen
```typescript
socket.on('session:ready', (session) => {});
socket.on('chat:history', (messages) => {});
socket.on('chat:message', (message) => {});
socket.on('connect_error', () => {});
socket.on('connect', () => {});
socket.on('disconnect', () => {});
```

## 💾 Type Definitions

```typescript
interface RealtimeSessionReady {
  account: {
    id: number;
    name: string;
    email: string;
    role: 'principal' | 'branch';
    unitStoreId: number | null;
  };
  units: Array<{
    id: number;
    name: string;
    parentStoreId: number | null;
    isMain: boolean;
  }>;
}

interface RealtimeChatMessage {
  id: number;
  unitStoreId: number;
  text: string | null;
  imageBase64: string | null;
  imageMimeType: string | null;
  createdAt: string;
  sender: { id, name, email, role, unitStoreId };
  unitStore: { id, name };
}
```

## 🎨 CSS Classes

```css
.chat-message-item { /* Animação fade in */ }
.connection-indicator { /* Pulse contínuo */ }
.typing-indicator { /* 3 pontos animados */ }
.chat-messages-container { /* Scroll suave */ }
```

## 🔍 Busca Rápida

```typescript
// Buscar por texto
messages.filter(m => m.text?.includes('keyword'))

// Buscar por usuário
messages.filter(m => m.sender.name.includes('João'))

// Buscar por loja
messages.filter(m => m.unitStore?.name.includes('Central'))

// Buscar por data
const today = new Date();
messages.filter(m => new Date(m.createdAt).toDateString() === today.toDateString())
```

## ⚙️ Configuração

```typescript
// Tema customizado
const chatTheme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#f50057' },
  },
});

<ThemeProvider theme={chatTheme}>
  <ChatRealtime />
</ThemeProvider>
```

## 🚨 Tratamento de Erros

```typescript
try {
  const result = await sendMessage(text, image, mime, unitId);
  if (!result.ok) {
    console.error('Erro:', result.error);
  }
} catch (error) {
  console.error('Falha:', error);
}
```

## 📊 Dados Disponíveis

```typescript
// Após conectar
const { session } = useChat();

// Informações do usuário
session?.account.name       // Nome
session?.account.email      // Email
session?.account.role       // 'principal' | 'branch'
session?.account.unitStoreId // ID da loja

// Unidades disponíveis
session?.units.map(u => ({
  id: u.id,
  name: u.name,
  isMain: u.isMain,
}))

// Mensagens
messages.map(m => ({
  id: m.id,
  text: m.text,
  sender: m.sender.name,
  time: new Date(m.createdAt),
  image: m.imageBase64,
}))
```

## 🎯 Casos de Uso

### 1. Buscar Mensagens de Hoje
```typescript
const today = new Date().toLocaleDateString('pt-BR');
const todayMessages = messages.filter(m => 
  new Date(m.createdAt).toLocaleDateString('pt-BR') === today
);
```

### 2. Contar Mensagens por Usuário
```typescript
const countByUser = messages.reduce((acc, m) => {
  acc[m.sender.name] = (acc[m.sender.name] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
```

### 3. Últimas 10 Mensagens
```typescript
const recent = messages.slice(-10);
```

### 4. Mensagens com Imagem
```typescript
const withImages = messages.filter(m => m.imageBase64);
```

### 5. Mensagens de uma Loja Específica
```typescript
const storeMessages = messages.filter(m => m.unitStoreId === storeId);
```

## 🐛 Debug

```typescript
// Log de estado
console.log('Socket:', socket?.connected);
console.log('Session:', session);
console.log('Messages:', messages.length);
console.log('Error:', error);

// Forçar atualização
refreshHistory();

// Limpar erro
clearError();
```

## ⚡ Dicas de Performance

```typescript
// ❌ Evitar
messages.filter(...).map(...).sort(...)  // Múltiplas iterações

// ✅ Melhor
useMemo(() => {
  return messages
    .filter(...)
    .map(...)
    .sort(...);
}, [messages]);

// ❌ Evitar
const handleClick = () => { /* ... */ }  // Recria a cada render

// ✅ Melhor
const handleClick = useCallback(() => {
  /* ... */
}, [dependencies]);
```

## 📱 Responsividade

| Tamanho | Breakpoint | Behavior |
|---------|-----------|----------|
| Mobile | xs (0px) | Stack vertical, avatar menor |
| Tablet | sm (600px) | Layout intermediário |
| Desktop | md (960px+) | Layout completo, animações |

## 🎬 Animações Disponíveis

```css
@keyframes fadeIn {}      /* Fade in com slide */
@keyframes slideIn {}     /* Slide da esquerda */
@keyframes pulse {}       /* Pulsação contínua */
@keyframes typing {}      /* Digitação (3 pontos) */
```

## 🔐 Segurança

```typescript
// ✓ Validações implementadas
- Tipo de arquivo (imagem)
- Tamanho máximo (10MB)
- Comprimento de texto (2000 chars)
- Token de autenticação

// ✓ Práticas seguras
- React sanitiza HTML por padrão
- Socket.io valida conexão
- Backend autoriza por usuário
```

## 📞 Precisa de Ajuda?

| Problema | Arquivo |
|----------|---------|
| Como usar? | `README.md` |
| Exemplos práticos? | `EXAMPLES.md` |
| Arquitetura? | `ARCHITECTURE.md` |
| Melhorias? | `IMPROVEMENTS.md` |
| Código? | `components/`, `hooks/` |

## 📋 Checklist de Implementação

- [x] Componentes modulares criados
- [x] Hooks customizados implementados
- [x] Estilos e animações adicionados
- [x] Busca de mensagens funcional
- [x] Histórico carregado e filtrado
- [x] Status de conexão indicado
- [x] Suporte a imagens
- [x] Responsividade mobile/desktop
- [x] Documentação completa
- [x] Exemplos de uso

## 🚀 Próximos Passos

1. Integrar em ambiente de desenvolvimento
2. Testar com backend real
3. Adicionar notificações (opcional)
4. Implementar indicador de digitação
5. Adicionar reações (emoji)
6. Implementar edição/deleção

---

**Última atualização:** Agosto 2026  
**Versão:** 2.0  
**Mantido por:** Equipe de Desenvolvimento
