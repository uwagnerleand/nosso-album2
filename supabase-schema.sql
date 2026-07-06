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
  criado_por TEXT,
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
  adicionado_por TEXT,
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
  adicionado_por TEXT,
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
  adicionado_por TEXT,
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
  de TEXT,
  para TEXT,
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
  criado_por TEXT,
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
  de TEXT,
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
  autor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: reactions (reações em memórias)
-- ============================================================
CREATE TABLE public.reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  memory_id UUID REFERENCES public.memories(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  autor TEXT,
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
-- ROW LEVEL SECURITY (RLS) - DESATIVADO
-- ============================================================
-- IMPORTANTE: RLS foi desativado porque o sistema usa autenticação
-- local (cookie/sessão própria) em vez do Supabase Auth.
-- A segurança é feita pelo middleware (proxy.ts) que protege as rotas.
-- ============================================================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.travels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.places DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsule_media DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wall_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: partner_profiles (perfil completo "Conheça seu Parceiro")
-- ============================================================

CREATE TABLE IF NOT EXISTS public.partner_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome_completo TEXT,
  como_gosta_de_ser_chamado TEXT,
  data_nascimento TEXT,
  cidade_nasceu TEXT,
  quem_faz_parte_familia TEXT,
  relacao_com_familia TEXT,
  pessoas_importantes_vida TEXT,
  melhor_lembranca_infancia TEXT,
  sonho_crianca TEXT,
  desenho_brincadeira_favorita TEXT,
  medo_crianca TEXT,
  tres_qualidades TEXT,
  tres_defeitos TEXT,
  maior_medo_atualmente TEXT,
  o_que_mais_irrita TEXT,
  o_que_mais_deixa_feliz TEXT,
  como_gosta_resolver_conflitos TEXT,
  cor_favorita TEXT,
  comida_favorita TEXT,
  bebida_favorita TEXT,
  musica_favorita TEXT,
  artista_banda_favorita TEXT,
  filme_favorito TEXT,
  serie_favorita TEXT,
  anime_favorito TEXT,
  livro_favorito TEXT,
  jogo_favorito TEXT,
  hobby_tempo_livre TEXT,
  esporte_favorito TEXT,
  talento_habilidade TEXT,
  maior_sonho TEXT,
  lugar_deseja_conhecer TEXT,
  objetivo_proximos_anos TEXT,
  linguagem_amor TEXT,
  como_demonstra_carinho TEXT,
  como_gosta_receber_carinho TEXT,
  nunca_pode_faltar_relacionamento TEXT,
  o_que_considera_traicao TEXT,
  encontro_perfeito TEXT,
  planos_futuro TEXT,
  rotina TEXT,
  dorme_cedo_ou_tarde TEXT,
  cafe_ou_cha TEXT,
  doce_ou_salgado TEXT,
  praia_ou_montanha TEXT,
  calor_ou_frio TEXT,
  animal_favorito TEXT,
  flor_favorita TEXT,
  perfume_favorito TEXT,
  maior_vergonha TEXT,
  maior_conquista TEXT,
  maior_arrependimento TEXT,
  algo_quase_ninguem_sabe TEXT,
  primeira_impressao_parceiro TEXT,
  momento_favorito_casal TEXT,
  o_que_mais_gosta_em_mim TEXT,
  gostaria_melhorar_casal TEXT,
  sonho_realizar_com_parceiro TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.partner_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('capsules', 'capsules', false);

-- Políticas públicas de storage (sem necessidade de auth)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (true);
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (true);

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