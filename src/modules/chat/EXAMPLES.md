# Exemplos de Uso - Chat Module

## Exemplo 1: Usar ChatRealtime Diretamente

```typescript
import ChatRealtime from './modules/chat/ChatRealtime';

function App() {
  return (
    <Routes>
      <Route path="/chat" element={<ChatRealtime />} />
    </Routes>
  );
}
```

## Exemplo 2: Usar useChat Hook Customizado

```typescript
import { useChat } from './modules/chat/hooks/useChat';

function MyCustomChat() {
  const {
    session,
    messages,
    loading,
    isConnected,
    error,
    sendMessage,
    refreshHistory,
    clearError,
  } = useChat({
    onError: (error) => console.error('Chat Error:', error),
    onSuccess: (msg) => console.log('Success:', msg),
  });

  const handleSendMessage = async () => {
    const result = await sendMessage(
      'Hello World',
      null,
      null,
      session?.account.unitStoreId,
    );

    if (result.ok) {
      // Message sent successfully
    }
  };

  return (
    <div>
      {error && <Alert severity="error">{error}</Alert>}
      {/* Render messages */}
    </div>
  );
}
```

## Exemplo 3: Usar useMessageFilter Hook

```typescript
import { useMessageFilter } from './modules/chat/hooks/useMessageFilter';
import type { RealtimeChatMessage } from './services/realtime';

function ChatWithFilters() {
  const [messages, setMessages] = useState<RealtimeChatMessage[]>([]);

  const { filtered, groupedByDate, stats } = useMessageFilter(messages, {
    searchQuery: 'importante',
    unitStoreId: 1,
    dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
  });

  return (
    <div>
      <h3>Total: {stats.total}</h3>
      <h3>Com imagens: {stats.withImages}</h3>
      <h3>Remetentes únicos: {stats.senderCount}</h3>

      {groupedByDate.map((group) => (
        <div key={group.date}>
          <h4>{group.date}</h4>
          {group.messages.map((msg) => (
            <div key={msg.id}>{msg.text}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

## Exemplo 4: Usar Componentes Individuais

```typescript
import {
  ChatHeader,
  ChatMessages,
  ChatInput,
  ChatSearch,
} from './modules/chat/components';
import type { RealtimeChatMessage, RealtimeSessionReady } from './services/realtime';
import { useState } from 'react';

function CustomChatLayout() {
  const [messages, setMessages] = useState<RealtimeChatMessage[]>([]);
  const [session, setSession] = useState<RealtimeSessionReady | null>(null);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [text, setText] = useState('');

  return (
    <div>
      <ChatHeader
        session={session}
        selectedUnitId={selectedUnit}
        onUnitChange={setSelectedUnit}
        isConnected={true}
        unitsCount={session?.units.length ?? 0}
        messagesCount={messages.length}
      />

      <ChatSearch onSearch={(query) => console.log(query)} />

      <ChatMessages
        messages={messages}
        loading={false}
        currentUserId={session?.account.id}
        selectedStoreId={selectedUnit}
      />

      <ChatInput
        text={text}
        onTextChange={setText}
        hasImage={false}
        onImageSelect={(file) => console.log(file)}
        onImageClear={() => {}}
        onSend={() => console.log('Send')}
      />
    </div>
  );
}
```

## Exemplo 5: Integrar com Redux (se usar)

```typescript
import { useChat } from './modules/chat/hooks/useChat';
import { useDispatch } from 'react-redux';
import { setChatMessages, setChatError } from './store/chatSlice';

function ChatWithRedux() {
  const dispatch = useDispatch();

  const { messages, error } = useChat({
    onError: (err) => dispatch(setChatError(err)),
  });

  useEffect(() => {
    if (messages.length > 0) {
      dispatch(setChatMessages(messages));
    }
  }, [messages, dispatch]);

  // Component logic
}
```

## Exemplo 6: Customizar Tema

```typescript
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ChatRealtime from './modules/chat/ChatRealtime';

const chatTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={chatTheme}>
      <ChatRealtime />
    </ThemeProvider>
  );
}
```

## Exemplo 7: Adicionar Notificações

```typescript
import { useChat } from './modules/chat/hooks/useChat';
import { useSnackbar } from 'notistack';

function ChatWithNotifications() {
  const { enqueueSnackbar } = useSnackbar();

  const { messages } = useChat({
    onSuccess: (msg) => enqueueSnackbar(msg, { variant: 'success' }),
    onError: (err) => enqueueSnackbar(err, { variant: 'error' }),
  });

  return <div>{/* Chat UI */}</div>;
}
```

## Exemplo 8: Persistir Estado em LocalStorage

```typescript
import { useChat } from './modules/chat/hooks/useChat';
import { useEffect } from 'react';

function ChatWithPersistence() {
  const { messages, setMessages } = useChat();

  // Save to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chatMessages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved messages:', e);
      }
    }
  }, [setMessages]);

  return <div>{/* Chat UI */}</div>;
}
```

## Estrutura de Tipos

```typescript
// Session
RealtimeSessionReady: {
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

// Message
RealtimeChatMessage: {
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
    role: 'principal' | 'branch';
    unitStoreId: number | null;
  };
  unitStore: {
    id: number;
    name: string;
  };
}
```

## Dicas de Performance

1. **Usar useMemo para filtros:**
```typescript
const filteredMessages = useMemo(() => {
  return messages.filter(/* ... */);
}, [messages, searchQuery]);
```

2. **Lazy load images:**
```typescript
<img src={imageSource} loading="lazy" />
```

3. **Virtualizar listas grandes:**
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={messages.length}
  itemSize={100}
>
  {({ index, style }) => (
    <ChatMessageItem 
      key={messages[index].id}
      message={messages[index]}
      style={style}
    />
  )}
</FixedSizeList>
```

## Troubleshooting

### Mensagens não carregam
- Verificar se o Socket.io está conectado: `useChat().isConnected`
- Verificar token de autenticação em localStorage
- Verificar console para erros

### Imagens não aparecem
- Verificar tamanho do arquivo (máximo 10MB)
- Verificar tipo de arquivo (deve ser imagem válida)
- Verificar se imageBase64 não está vazio

### Performance ruim com muitas mensagens
- Implementar virtualização com react-window
- Implementar paginação do histórico
- Usar debounce na busca

## Suporte

Para bugs ou sugestões, abra uma issue ou entre em contato com o time de desenvolvimento.
