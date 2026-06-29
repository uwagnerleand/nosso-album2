-- ============================================================
-- NOSSO ÁLBUM - Schema do Banco de Dados Supabase (PostgreSQL)
-- ============================================================

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- TABELA: profiles (perfil de cada usuário do casal)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nome TEXT,
  apelido TEXT,
  data_nascimento DATE,
  cor_favorita TEXT,
  comida_favorita TEXT,
  filme_favorito TEXT,
  musica_favorita TEXT,
  sonhos TEXT,
  curiosidades TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: couple_config (configurações globais do casal)
-- ============================================================
CREATE TABLE public.couple_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome_casal TEXT DEFAULT 'Nosso Álbum',
  frase_personalizada TEXT DEFAULT 'Cada memória é um capítulo da nossa história.',
  data_inicio_namoro DATE,
  data_casamento DATE,
  foto_casal_url TEXT,
  tema TEXT DEFAULT 'dark',
  cor_primaria TEXT DEFAULT '#f43f5e',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: memories (linha do tempo / memórias)
-- ============================================================
CREATE TABLE public.memories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  local TEXT,
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  categoria TEXT DEFAULT 'geral',
  emoji TEXT DEFAULT '❤️',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  favorito BOOLEAN DEFAULT FALSE,
  criado_por UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: photos (galeria de fotos)
-- ============================================================
CREATE TABLE public.photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  legenda TEXT,
  data DATE,
  local TEXT,
  categoria TEXT DEFAULT 'geral',
  favorito BOOLEAN DEFAULT FALSE,
  tamanho_bytes BIGINT,
  largura INT,
  altura INT,
  memory_id UUID REFERENCES public.memories(id) ON DELETE SET NULL,
  viagem_id UUID,
  adicionado_por UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: videos
-- ============================================================
CREATE TABLE public.videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  titulo TEXT,
  descricao TEXT,
  duracao INT,
  data DATE,
  local TEXT,
  categoria TEXT DEFAULT 'geral',
  favorito BOOLEAN DEFAULT FALSE,
  tamanho_bytes BIGINT,
  memory_id UUID REFERENCES public.memories(id) ON DELETE SET NULL,
  viagem_id UUID,
  adicionado_por UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: travels (viagens)
-- ============================================================
CREATE TABLE public.travels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  destino TEXT NOT NULL,
  cidade TEXT,
  estado TEXT,
  pais TEXT,
  data_inicio DATE,
  data_fim DATE,
  descricao TEXT,
  diario TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  cover_url TEXT,
  favorito BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atualizar referência foreign key em photos/videos
ALTER TABLE public.photos ADD CONSTRAINT fk_viagem FOREIGN KEY (viagem_id) REFERENCES public.travels(id) ON DELETE SET NULL;
ALTER TABLE public.videos ADD CONSTRAINT fk_viagem FOREIGN KEY (viagem_id) REFERENCES public.travels(id) ON DELETE SET NULL;

-- ============================================================
-- TABELA: places (lugares visitados)
-- ============================================================
CREATE TABLE public.places (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  descricao TEXT,
  data DATE,
  nota INT CHECK (nota >= 1 AND nota <= 5),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  cover_url TEXT,
  favorito BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: special_dates (datas especiais)
-- ============================================================
CREATE TABLE public.special_dates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  tipo TEXT DEFAULT 'outro',
  descricao TEXT,
  emoji TEXT DEFAULT '📅',
  cor TEXT DEFAULT '#f43f5e',
  lembrete BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: playlist (músicas do casal)
-- ============================================================
CREATE TABLE public.playlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  artista TEXT,
  spotify_url TEXT,
  youtube_url TEXT,
  descricao TEXT,
  motivo TEXT,
  favorito BOOLEAN DEFAULT FALSE,
  ordem INT DEFAULT 0,
  adicionado_por UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: letters (cartas privadas)
-- ============================================================
CREATE TABLE public.letters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  de UUID REFERENCES public.profiles(id),
  para UUID REFERENCES public.profiles(id),
  favorito BOOLEAN DEFAULT FALSE,
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: goals (metas do casal)
-- ============================================================
CREATE TABLE public.goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'pendente',
  data_prevista DATE,
  progresso INT DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  emoji TEXT DEFAULT '🎯',
  categoria TEXT DEFAULT 'geral',
  concluido BOOLEAN DEFAULT FALSE,
  data_conclusao DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: time_capsules (cápsulas do tempo)
-- ============================================================
CREATE TABLE public.time_capsules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  data_abertura DATE NOT NULL,
  aberta BOOLEAN DEFAULT FALSE,
  data_aberta TIMESTAMPTZ,
  criado_por UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: capsule_media (mídia das cápsulas)
-- ============================================================
CREATE TABLE public.capsule_media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  capsule_id UUID REFERENCES public.time_capsules(id) ON DELETE CASCADE,
  tipo TEXT DEFAULT 'foto',
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: wall_messages (mural de recados)
-- ============================================================
CREATE TABLE public.wall_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mensagem TEXT NOT NULL,
  emoji TEXT,
  de UUID REFERENCES public.profiles(id),
  cor_fundo TEXT DEFAULT '#fce7f3',
  favorito BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: comments (comentários privados em fotos)
-- ============================================================
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  autor UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: reactions (reações em memórias)
-- ============================================================
CREATE TABLE public.reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  memory_id UUID REFERENCES public.memories(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  autor UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(memory_id, autor)
);

-- ============================================================
-- FUNÇÕES E TRIGGERS
-- ============================================================

-- Trigger para criar perfil ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.couple_config FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.memories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.photos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.travels FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.places FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.special_dates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.playlist FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.letters FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.time_capsules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.wall_messages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsule_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wall_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Políticas: somente usuários autenticados podem ler/escrever
CREATE POLICY "Authenticated users can do everything" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.couple_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.memories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.photos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.videos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.travels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.places FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.special_dates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.playlist FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.letters FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.goals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.time_capsules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.capsule_media FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.wall_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can do everything" ON public.reactions FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('capsules', 'capsules', false);

CREATE POLICY "Auth users can upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can view" ON storage.objects FOR SELECT USING (auth.role() = 'authenticated' OR bucket_id IN ('photos', 'videos', 'avatars', 'covers'));
CREATE POLICY "Auth users can update" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- CRIAÇÃO DOS USUÁRIOS DO CASAL (Auth)
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================
--
-- PASSO 1: Criar os usuários em auth.users
-- (Use a inscrição via API ou o painel Authentication > Add User)
--
--   Email 1: lcunhaleandro@gmail.com
--   Email 2: debgarcia491@gmail.com
--   Senha para ambos: roxo&vermelho
--
-- PASSO 2: Após criar os usuários acima, rode o INSERT abaixo
-- para preencher os perfis (ajuste os UUIDs pelos reais):
--
-- INSERT INTO public.profiles (id, email, nome, apelido)
-- VALUES
--   ('<uuid_do_leandro>', 'lcunhaleandro@gmail.com', 'Leandro', 'Leandro'),
--   ('<uuid_da_debora>',  'debgarcia491@gmail.com',  'Débora',  'Débora');

-- ============================================================
-- DADOS INICIAIS
-- ============================================================
INSERT INTO public.couple_config (nome_casal, frase_personalizada, tema)
VALUES ('Wagner & Débora', 'Cada memória é um capítulo da nossa história.', 'dark');
