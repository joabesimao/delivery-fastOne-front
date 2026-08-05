# 🏗️ Arquitetura do Chat Module

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ChatRealtime (Página)                         │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                         ChatHeader                              ││
│  │  ┌──────────────────────────────────────────────────────────┐  ││
│  │  │ Título | Status | Botão Atualizar | Botão Expandir    │  ││
│  │  ├──────────────────────────────────────────────────────────┤  ││
│  │  │ [Expandido] Seletor Loja | Stats | User Info           │  ││
│  │  └──────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      Área de Chat (Scrollable)                  ││
│  │                                                                  ││
│  │  ┌────────────────────────────────────────────────────────┐    ││
│  │  │ ChatSearch                                             │    ││
│  │  │ [🔍 Buscar...]                                         │    ││
│  │  └────────────────────────────────────────────────────────┘    ││
│  │                                                                  ││
│  │  ┌────────────────────────────────────────────────────────┐    ││
│  │  │ ChatMessages                                           │    ││
│  │  │                                                        │    ││
│  │  │  ─── Hoje ───                                         │    ││
│  │  │  [Avatar] João                                        │    ││
│  │  │           Filial Santa Cruz • 10:30                   │    ││
│  │  │           ┌──────────────────────────┐                │    ││
│  │  │           │ Olá a todos!             │                │    ││
│  │  │           └──────────────────────────┘                │    ││
│  │  │                                                        │    ││
│  │  │                          [Avatar] Você               │    ││
│  │  │                                  Matriz • 10:35      │    ││
│  │  │                  ┌──────────────────────────┐         │    ││
│  │  │                  │ Oi João! Tudo bem?      │         │    ││
│  │  │                  └──────────────────────────┘         │    ││
│  │  │                                                        │    ││
│  │  │  ─── Ontem ───                                        │    ││
│  │  │  ...                                                  │    ││
│  │  └────────────────────────────────────────────────────────┘    ││
│  │                                                                  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      ChatInput                                  ││
│  │  ┌──────────────────────────────────────────────────────────┐  ││
│  │  │ [Área de Texto Multilinhas]                            │  ││
│  │  │ 45/2000 caracteres                                     │  ││
│  │  ├──────────────────────────────────────────────────────────┤  ││
│  │  │ [📷 Adicionar Foto] [Spacer] [✉️ Enviar]              │  ││
│  │  ├──────────────────────────────────────────────────────────┤  ││
│  │  │ [Barra de Progresso de Envio]                         │  ││
│  │  └──────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

      Socket.io Connection Manager
         │
         ├─ session:ready
         ├─ chat:history
         ├─ chat:message
         ├─ connect_error
         ├─ connect
         └─ disconnect
```

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                      ChatRealtime State                      │
│                                                              │
│  - messages: RealtimeChatMessage[]                         │
│  - session: RealtimeSessionReady | null                    │
│  - socket: Socket | null                                  │
│  - selectedUnitId: string                                 │
│  - text: string                                           │
│  - imageBase64: string | null                             │
│  - isConnected: boolean                                   │
│  - searchQuery: string                                    │
│  - loading: boolean                                       │
│  - sending: boolean                                       │
│  - error: string | null                                  │
└─────────────────────────────────────────────────────────────┘
         │
         ├─────────────────────┬────────────────────┬─────────────────┐
         │                     │                    │                 │
         ▼                     ▼                    ▼                 ▼
   ┌──────────────┐    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │  ChatHeader  │    │ChatMessages  │   │  ChatInput   │   │  ChatSearch  │
   │              │    │              │   │              │   │              │
   │ Props:       │    │ Props:       │   │ Props:       │   │ Props:       │
   │ - session    │    │ - messages   │   │ - text       │   │ - onSearch   │
   │ - isConnected│    │ - loading    │   │ - hasImage   │   │              │
   │ - stats      │    │ - currentId  │   │ - sending    │   │ Events:      │
   │              │    │              │   │              │   │ - onChange   │
   │ Events:      │    │ Events:      │   │ Events:      │   └──────────────┘
   │ - onUnitChg  │    │ - onDelete   │   │ - onSend     │
   │ - onRefresh  │    │              │   │ - onImgSel   │
   └──────────────┘    └──────────────┘   └──────────────┘
         │
         ▼
    Socket.io Emit:
    - chat:send
    - chat:fetch-history
```

## Hierarquia de Componentes

```
ChatRealtime
├── ChatHeader
│   ├── Typography (título)
│   ├── IconButton (expand)
│   ├── TextField (seletor)
│   ├── Chip (status)
│   └── Collapse (details)
│
├── ChatSearch
│   ├── TextField (busca)
│   └── Chip (filtros)
│
├── ChatMessages
│   ├── Box (container com scroll)
│   └── Stack (messages list)
│       └── ChatMessageItem (repetido)
│           ├── Avatar (sender)
│           ├── Paper (bubble)
│           ├── Image (if exists)
│           └── Menu (delete)
│
└── ChatInput
    ├── Paper (image preview)
    ├── TextField (message)
    ├── Button (photo)
    ├── Button (send)
    └── LinearProgress (loading)
```

## Fluxo de Componentes

```
┌──────────────────┐
│  Socket.io       │
│  Events In       │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  useEffect Listeners     │
│  - session:ready         │
│  - chat:history          │
│  - chat:message          │
│  - connect/disconnect    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  State Updates           │
│  - messages              │
│  - session               │
│  - isConnected           │
│  - loading               │
└────────┬─────────────────┘
         │
         ├──────────────────────────────────────────────┐
         │                                              │
         ▼                                              ▼
┌──────────────────────┐                    ┌──────────────────────┐
│  Filter Logic        │                    │  Render Components   │
│                      │                    │                      │
│  - searchQuery       │                    │  - ChatHeader        │
│  - selectedUnitId    │                    │  - ChatSearch        │
│  - dateRange         │                    │  - ChatMessages      │
│  - sender            │                    │  - ChatInput         │
└────────┬─────────────┘                    └────────┬─────────────┘
         │                                          │
         └──────────────────┬───────────────────────┘
                            │
                            ▼
                ┌─────────────────────────┐
                │  User Interactions      │
                │                         │
                │  - Type message         │
                │  - Select photo         │
                │  - Select store         │
                │  - Click send           │
                │  - Search               │
                └────────────┬────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │  Event Handlers          │
                │                          │
                │  - handleSend()          │
                │  - handleImageSelect()   │
                │  - handleSearch()        │
                │  - handleUnitChange()    │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │  Socket.io Emit         │
                │                          │
                │  - chat:send            │
                │  - chat:fetch-history   │
                └────────────┬─────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Backend API  │
                      │              │
                      │ Processa e   │
                      │ Broadcast    │
                      └──────────────┘
```

## Hooks Customizados

```
┌─────────────────────────────────────────────────────┐
│              useChat Hook                           │
│                                                     │
│  Input: UseChatOptions {                           │
│    onError?: (error: string) => void              │
│    onSuccess?: (msg: string) => void              │
│  }                                                 │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Internal State                                │ │
│  │  - socket                                    │ │
│  │  - session                                   │ │
│  │  - messages                                  │ │
│  │  - loading                                   │ │
│  │  - isConnected                               │ │
│  │  - error                                     │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Methods                                       │ │
│  │  - sendMessage(text, image, mime, store)    │ │
│  │  - refreshHistory()                         │ │
│  │  - clearError()                             │ │
│  │  - deleteMessage(id)                        │ │
│  │  - setMessages(msgs)                        │ │
│  │  - setSession(session)                      │ │
│  │  - setError(error)                          │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│         useMessageFilter Hook                       │
│                                                     │
│  Input: UseMessageFilterOptions {                  │
│    searchQuery?: string                           │
│    unitStoreId?: string | number                  │
│    senderId?: number                              │
│    dateFrom?: Date                                │
│    dateTo?: Date                                  │
│  }                                                 │
│                                                     │
│  Output: {                                          │
│    filtered: RealtimeChatMessage[]               │
│    groupedByDate: Array<{                         │
│      date: string,                                │
│      messages: RealtimeChatMessage[]             │
│    }>                                             │
│    stats: {                                        │
│      total: number                               │
│      withImages: number                          │
│      withText: number                            │
│      senderCount: number                         │
│      storeCount: number                          │
│    }                                              │
│  }                                                 │
└─────────────────────────────────────────────────────┘
```

## Ciclo de Vida

```
1. Inicialização
   ├─ getRealtimeSocket() obtém socket existente
   ├─ Socket emite 'session:ready'
   └─ State recebe dados de sessão e unidades

2. Carregamento de Histórico
   ├─ Socket emite 'chat:history'
   ├─ Estado é atualizado com mensagens
   └─ Messages são renderizadas

3. Envio de Mensagem
   ├─ User digita e clica enviar
   ├─ handleSend() é chamado
   ├─ socket.emit('chat:send', data)
   ├─ Backend processa e broadcast
   └─ socket.on('chat:message') recebe confirmação

4. Busca
   ├─ User digita na busca
   ├─ searchQuery state é atualizado
   ├─ useMessageFilter filtra mensagens
   └─ ChatMessages re-renderiza com dados filtrados

5. Desconexão
   ├─ Socket emite 'disconnect'
   ├─ isConnected = false
   └─ UI mostra status de desconexão
```

## Performance Considerations

```
┌─────────────────────────────────────────┐
│  Otimizações Implementadas              │
│                                         │
│  ✓ useMemo para filtros                │
│  ✓ useCallback para event handlers     │
│  ✓ Component memoization (potential)   │
│  ✓ Debounce search (via useMemo)       │
│  ✓ Scroll virtualização (ready to add) │
│  ✓ Image lazy loading (ready to add)   │
│                                         │
└─────────────────────────────────────────┘
```

## Escalabilidade

```
Atual (OK):
- 100+ mensagens
- 10+ usuários simultâneos
- Imagens até 10MB

Com Otimizações:
- 1000+ mensagens (scroll virtual)
- 100+ usuários (socket rooms)
- Streaming de vídeo (com backend support)
- Paginação de histórico

Recomendações:
- Implementar react-window para listas grandes
- Adicionar paginação no backend
- Usar Redis para cache de histórico
- Implementar compressão de imagens
```

## Segurança

```
✓ Token-based authentication (Socket.io)
✓ Input validation (arquivo tipo/tamanho)
✓ XSS prevention (React sanitizes by default)
✓ CSRF tokens (Socket.io built-in)
✓ Rate limiting (backend)
✓ Message encryption (pronto para implementar)
✓ User authorization (backend middleware)
```

---

**Diagrama criado:** Agosto 2026  
**Versão:** 2.0  
**Status:** Documentado e Pronto para Uso
