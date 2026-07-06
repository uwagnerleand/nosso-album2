-- ============================================================
-- NOSSO ÁLBUM — SETUP FINAL (Execute este no SQL Editor)
-- Resolve: FK auth.users, RLS, dados iniciais, storage
-- ============================================================

-- ============================================================
-- PASSO 1: Remover dependência de auth.users na tabela profiles
-- ============================================================

-- Remove FK constraint que aponta para auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Remove a PK atual para recriar sem FK
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Garante que id tem default (gen_random_uuid)
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Recria PK sem FK para auth.users
ALTER TABLE public.profiles ADD PRIMARY KEY (id);

-- Adiciona unique em email (para buscas por email)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_unique;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Remove o trigger que dependia de auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================================
-- PASSO 2: Inserir perfis dos dois usuários do casal
-- ============================================================

INSERT INTO public.profiles (email, nome, apelido)
VALUES
  ('lcunhaleandro@gmail.com', 'Leandro', 'Leandro'),
  ('debgarcia491@gmail.com',  'Débora',  'Débora')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- PASSO 3: Garantir que couple_config tem dados
-- ============================================================

INSERT INTO public.couple_config (nome_casal, frase_personalizada, tema)
SELECT 'Wagner & Débora', 'Cada memória é um capítulo da nossa história.', 'dark'
WHERE NOT EXISTS (SELECT 1 FROM public.couple_config LIMIT 1);

-- ============================================================
-- PASSO 4: Desativar RLS em todas as tabelas (sem Supabase Auth)
-- ============================================================

ALTER TABLE public.profiles         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_config    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.travels          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.places           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_dates    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsules    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.capsule_media    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wall_messages    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions        DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- PASSO 5: Criar buckets de Storage (se não existirem)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('photos',   'photos',   true),
  ('videos',   'videos',   true),
  ('avatars',  'avatars',  true),
  ('covers',   'covers',   true),
  ('capsules', 'capsules', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PASSO 6: Remover políticas de storage antigas e recriar
-- ============================================================

DROP POLICY IF EXISTS "Public Access"  ON storage.objects;
DROP POLICY IF EXISTS "Public Upload"  ON storage.objects;
DROP POLICY IF EXISTS "Public Update"  ON storage.objects;
DROP POLICY IF EXISTS "Public Delete"  ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can view"   ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete" ON storage.objects;

-- Políticas públicas — sem necessidade de auth JWT
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (true);
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (true);

-- ============================================================
-- VERIFICAÇÃO: Listar dados inseridos
-- ============================================================

SELECT 'profiles' AS tabela, COUNT(*) AS registros FROM public.profiles
UNION ALL
SELECT 'couple_config', COUNT(*) FROM public.couple_config;

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

-- ⚠️ IMPORTANTE: Desabilitar RLS DEPOIS de criar a tabela
ALTER TABLE public.partner_profiles DISABLE ROW LEVEL SECURITY;

-- Insert initial records for both users (they will edit later)
INSERT INTO public.partner_profiles (email)
VALUES
  ('lcunhaleandro@gmail.com'),
  ('debgarcia491@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- ⚠️ ATENÇÃO: Se você já executou o script antes e está com erro
-- "new row violates row-level security policy", execute APENAS:
--
--   ALTER TABLE public.partner_profiles DISABLE ROW LEVEL SECURITY;
-- ============================================================

-- ============================================================
-- PRONTO! O sistema está configurado sem Supabase Auth.
-- Usuários: lcunhaleandro@gmail.com / debgarcia491@gmail.com
-- Senha: roxo&vermelho
-- ============================================================
