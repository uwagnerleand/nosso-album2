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
-- PRONTO! O sistema está configurado sem Supabase Auth.
-- Usuários: lcunhaleandro@gmail.com / debgarcia491@gmail.com
-- Senha: roxo&vermelho
-- ============================================================
