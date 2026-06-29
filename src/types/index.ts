export interface Profile {
  id: string
  email: string
  nome: string | null
  apelido: string | null
  data_nascimento: string | null
  cor_favorita: string | null
  comida_favorita: string | null
  filme_favorito: string | null
  musica_favorita: string | null
  sonhos: string | null
  curiosidades: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface CoupleConfig {
  id: string
  nome_casal: string
  frase_personalizada: string
  data_inicio_namoro: string | null
  data_casamento: string | null
  foto_casal_url: string | null
  tema: 'dark' | 'light'
  cor_primaria: string
  created_at: string
  updated_at: string
}

export interface Memory {
  id: string
  titulo: string
  descricao: string | null
  data: string
  local: string | null
  cidade: string | null
  estado: string | null
  pais: string
  categoria: string
  emoji: string
  latitude: number | null
  longitude: number | null
  favorito: boolean
  criado_por: string | null
  created_at: string
  updated_at: string
  photos?: Photo[]
  videos?: Video[]
}

export interface Photo {
  id: string
  url: string
  thumbnail_url: string | null
  legenda: string | null
  data: string | null
  local: string | null
  categoria: string
  favorito: boolean
  tamanho_bytes: number | null
  largura: number | null
  altura: number | null
  memory_id: string | null
  viagem_id: string | null
  adicionado_por: string | null
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  url: string
  thumbnail_url: string | null
  titulo: string | null
  descricao: string | null
  duracao: number | null
  data: string | null
  local: string | null
  categoria: string
  favorito: boolean
  tamanho_bytes: number | null
  memory_id: string | null
  viagem_id: string | null
  adicionado_por: string | null
  created_at: string
  updated_at: string
}

export interface Travel {
  id: string
  destino: string
  cidade: string | null
  estado: string | null
  pais: string | null
  data_inicio: string | null
  data_fim: string | null
  descricao: string | null
  diario: string | null
  latitude: number | null
  longitude: number | null
  cover_url: string | null
  favorito: boolean
  created_at: string
  updated_at: string
  photos?: Photo[]
  videos?: Video[]
}

export interface Place {
  id: string
  nome: string
  cidade: string | null
  estado: string | null
  pais: string
  descricao: string | null
  data: string | null
  nota: number | null
  latitude: number | null
  longitude: number | null
  cover_url: string | null
  favorito: boolean
  created_at: string
  updated_at: string
}

export interface SpecialDate {
  id: string
  titulo: string
  data: string
  tipo: string
  descricao: string | null
  emoji: string
  cor: string
  lembrete: boolean
  created_at: string
  updated_at: string
}

export interface PlaylistItem {
  id: string
  nome: string
  artista: string | null
  spotify_url: string | null
  youtube_url: string | null
  descricao: string | null
  motivo: string | null
  favorito: boolean
  ordem: number
  adicionado_por: string | null
  created_at: string
  updated_at: string
}

export interface Letter {
  id: string
  titulo: string
  conteudo: string
  de: string | null
  para: string | null
  favorito: boolean
  lida: boolean
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Goal {
  id: string
  titulo: string
  descricao: string | null
  status: 'pendente' | 'em-progresso' | 'concluida'
  data_prevista: string | null
  progresso: number
  emoji: string
  categoria: string
  concluido: boolean
  data_conclusao: string | null
  created_at: string
  updated_at: string
}

export interface TimeCapsule {
  id: string
  titulo: string
  mensagem: string | null
  data_abertura: string
  aberta: boolean
  data_aberta: string | null
  criado_por: string | null
  created_at: string
  updated_at: string
  media?: CapsuleMedia[]
}

export interface CapsuleMedia {
  id: string
  capsule_id: string
  tipo: 'foto' | 'video'
  url: string
  created_at: string
}

export interface WallMessage {
  id: string
  mensagem: string
  emoji: string | null
  de: string | null
  cor_fundo: string
  favorito: boolean
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Comment {
  id: string
  photo_id: string
  texto: string
  autor: string | null
  created_at: string
  author?: Profile
}

export interface DashboardStats {
  diasJuntos: number
  totalFotos: number
  totalVideos: number
  totalLugares: number
  totalViagens: number
  totalMemories: number
  proximoAniversario: { titulo: string; data: string; diasRestantes: number } | null
  ultimaMemoria: Memory | null
  tempoJuntos: {
    anos: number
    meses: number
    dias: number
    horas: number
    minutos: number
    segundos: number
  }
}

export type MemoryCategory =
  | 'geral'
  | 'namoro'
  | 'viagem'
  | 'conquista'
  | 'aniversario'
  | 'primeiro-beijo'
  | 'pedido'
  | 'casamento'
  | 'familia'
  | 'amigos'
  | 'outro'
