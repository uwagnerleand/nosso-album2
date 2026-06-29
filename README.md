# 💑 Nosso Álbum — Álbum Digital do Casal

> Um álbum digital privado, elegante e sincronizado para registrar, organizar e reviver cada memória do casal.

---

## ✨ Funcionalidades

| Página | Descrição |
|--------|-----------|
| 🏠 Tela Inicial | Landing page animada com glassmorphism |
| 🔐 Login | Autenticação segura, recuperação de senha |
| 📊 Dashboard | Contador em tempo real, stats, próxima data |
| 📖 Nossa História | Editor de texto rico com prévia markdown |
| ⏱️ Linha do Tempo | Timeline elegante por ano |
| 🖼️ Galeria | Pinterest layout, lightbox, upload drag & drop |
| 🎥 Vídeos | Player HTML5, galeria e upload |
| 📍 Lugares | Lugares visitados com avaliação em estrelas |
| ✈️ Viagens | Diário de viagens com fotos e datas |
| 📅 Datas Especiais | Countdown para próximas datas |
| 🎵 Playlist | Músicas com links Spotify/YouTube |
| 💌 Cartas | Cartas privadas entre o casal |
| 🎯 Metas | Bucket list com progresso e status |
| ⭐ Favoritos | Memórias e fotos favoritas |
| 🗓️ Calendário | Visão mensal de memórias e datas |
| 📦 Cápsula do Tempo | Mensagens para abrir no futuro |
| 💬 Mural | Post-its digitais entre o casal |
| 👤 Perfil | Informações pessoais e foto |
| ⚙️ Configurações | Tema, senha, backup JSON |
| 📱 PWA | Instalável no celular como app nativo |

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript |
| Estilo | Tailwind CSS v4, Framer Motion |
| Backend | Next.js API Routes + Supabase |
| Banco de Dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth (JWT) |
| Storage | Supabase Storage |
| Estado Global | Zustand |
| Data Fetching | TanStack Query |

---

## 🚀 Instalação

### 1. Pré-requisitos

- Node.js 18+
- Conta gratuita no [Supabase](https://supabase.com)

### 2. Instalar dependências

```bash
npm install
```

### 3. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Aguarde a criação (~2 min)

### 4. Criar o banco de dados

1. No painel do Supabase → **SQL Editor** → **New Query**
2. Cole todo o conteúdo de `supabase-schema.sql`
3. Clique **Run** ▶️

### 5. Configurar variáveis de ambiente

Edite o arquivo `.env.local` na raiz:

```env
# Encontre em: Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COUPLE_NAME=Wagner & Débora
```

### 6. Criar os dois usuários do casal

No Supabase → **Authentication** → **Users** → **Add User**

Crie exatamente **2 usuários** com emails reais do casal.

### 7. Rodar o projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🌐 Deploy (Vercel — Gratuito)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer deploy
vercel
```

Após o deploy, no Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://seu-site.vercel.app`
- **Redirect URLs**: `https://seu-site.vercel.app/api/auth/callback`

---

## 📁 Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/login/          # Tela de login
│   ├── (dashboard)/           # Todas as páginas protegidas
│   │   ├── layout.tsx         # Layout com sidebar
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── galeria/           # Galeria de fotos
│   │   ├── linha-do-tempo/    # Timeline
│   │   ├── nossa-historia/    # Texto da história
│   │   ├── videos/            # Galeria de vídeos
│   │   ├── lugares/           # Lugares visitados
│   │   ├── viagens/           # Registro de viagens
│   │   ├── datas-especiais/   # Datas importantes
│   │   ├── playlist/          # Músicas do casal
│   │   ├── cartas/            # Cartas privadas
│   │   ├── metas/             # Metas do casal
│   │   ├── momentos-favoritos/
│   │   ├── calendario/
│   │   ├── capsula-do-tempo/
│   │   ├── mural/
│   │   ├── perfil/
│   │   └── configuracoes/
│   ├── api/auth/callback/     # OAuth callback
│   └── page.tsx               # Landing page
├── components/
│   ├── layout/                # Sidebar, Header
│   ├── features/              # UploadZone
│   ├── ui/                    # Button, Input, Card, Avatar, Badge
│   └── providers.tsx          # Theme + Query providers
├── hooks/
│   └── useTimeCounter.ts      # Contador em tempo real
├── lib/
│   ├── supabase/client.ts     # Cliente browser
│   ├── supabase/server.ts     # Cliente server
│   └── utils.ts               # Helpers, formatadores
├── store/
│   └── useAppStore.ts         # Estado global (Zustand)
├── types/
│   └── index.ts               # Todos os tipos TypeScript
└── proxy.ts                   # Proteção de rotas (Next.js 16)
```

---

## 🗃️ Tabelas do Banco

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfil dos usuários |
| `couple_config` | Configurações do casal |
| `memories` | Linha do tempo |
| `photos` | Galeria de fotos |
| `videos` | Galeria de vídeos |
| `travels` | Registro de viagens |
| `places` | Lugares visitados |
| `special_dates` | Datas especiais |
| `playlist` | Músicas do casal |
| `letters` | Cartas privadas |
| `goals` | Metas do casal |
| `time_capsules` | Cápsulas do tempo |
| `wall_messages` | Mural de recados |

---

## 🔒 Segurança

- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Somente usuários autenticados acessam dados
- ✅ JWT com refresh automático
- ✅ Proteção de rotas via proxy
- ✅ Senhas com hash bcrypt (Supabase)
- ✅ Uploads validados por tipo e tamanho

---

## 📱 Instalar como App (PWA)

**Android (Chrome):** Menu ⋮ → Adicionar à tela inicial  
**iOS (Safari):** Compartilhar ↑ → Adicionar à Tela de Início

---

Feito com ❤️ para vocês.
