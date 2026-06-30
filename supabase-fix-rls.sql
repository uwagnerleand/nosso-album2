-- ============================================================
-- CORREÇÃO: Desativar RLS + Alterar colunas de UUID para TEXT
-- Execute APENAS este script no SQL Editor do Supabase
-- ============================================================

-- 1. REMOVER CONSTRAINTS DE FOREIGN KEY (que apontam para UUID)
ALTER TABLE public.memories DROP CONSTRAINT IF EXISTS memories_criado_por_fkey;
ALTER TABLE public.photos DROP CONSTRAINT IF EXISTS photos_adicionado_por_fkey;
ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_adicionado_por_fkey;
ALTER TABLE public.playlist DROP CONSTRAINT IF EXISTS playlist_adicionado_por_fkey;
ALTER TABLE public.letters DROP CONSTRAINT IF EXISTS letters_de_fkey;
ALTER TABLE public.letters DROP CONSTRAINT IF EXISTS letters_para_fkey;
ALTER TABLE public.time_capsules DROP CONSTRAINT IF EXISTS time_capsules_criado_por_fkey;
ALTER TABLE public.wall_messages DROP CONSTRAINT IF EXISTS wall_messages_de_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_autor_fkey;
ALTER TABLE public.reactions DROP CONSTRAINT IF EXISTS reactions_autor_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. DESATIVAR RLS EM TODAS AS TABELAS
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

-- 3. REMOVER POLÍTICAS RLS ANTIGAS (que exigiam auth.role())
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.couple_config;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.memories;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.photos;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.videos;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.travels;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.places;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.special_dates;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.playlist;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.letters;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.time_capsules;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.capsule_media;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.wall_messages;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.reactions;

-- 4. REMOVER POLÍTICAS DE STORAGE ANTIGAS
DROP POLICY IF EXISTS "Auth users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can view" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete" ON storage.objects;

-- 5. CRIAR POLÍTICAS PÚBLICAS DE STORAGE
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (true);
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (true);

-- 6. ALTERAR COLUNAS QUE ERAM UUID PARA TEXT
-- (para armazenar email em vez de UUID)
ALTER TABLE public.memories ALTER COLUMN criado_por TYPE TEXT USING criado_por::TEXT;
ALTER TABLE public.photos ALTER COLUMN adicionado_por TYPE TEXT USING adicionado_por::TEXT;
ALTER TABLE public.videos ALTER COLUMN adicionado_por TYPE TEXT USING adicionado_por::TEXT;
ALTER TABLE public.playlist ALTER COLUMN adicionado_por TYPE TEXT USING adicionado_por::TEXT;
ALTER TABLE public.letters ALTER COLUMN de TYPE TEXT USING de::TEXT;
ALTER TABLE public.letters ALTER COLUMN para TYPE TEXT USING para::TEXT;
ALTER TABLE public.time_capsules ALTER COLUMN criado_por TYPE TEXT USING criado_por::TEXT;
ALTER TABLE public.wall_messages ALTER COLUMN de TYPE TEXT USING de::TEXT;
ALTER TABLE public.comments ALTER COLUMN autor TYPE TEXT USING autor::TEXT;
ALTER TABLE public.reactions ALTER COLUMN autor TYPE TEXT USING autor::TEXT;

-- ============================================================
-- PRONTO! Agora o sistema funciona sem Supabase Auth.
-- ============================================================