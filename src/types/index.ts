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

export interface PartnerProfile {
  id: string
  email: string
  nome_completo: string | null
  como_gosta_de_ser_chamado: string | null
  data_nascimento: string | null
  cidade_nasceu: string | null
  quem_faz_parte_familia: string | null
  relacao_com_familia: string | null
  pessoas_importantes_vida: string | null
  melhor_lembranca_infancia: string | null
  sonho_crianca: string | null
  desenho_brincadeira_favorita: string | null
  medo_crianca: string | null
  tres_qualidades: string | null
  tres_defeitos: string | null
  maior_medo_atualmente: string | null
  o_que_mais_irrita: string | null
  o_que_mais_deixa_feliz: string | null
  como_gosta_resolver_conflitos: string | null
  cor_favorita: string | null
  comida_favorita: string | null
  bebida_favorita: string | null
  musica_favorita: string | null
  artista_banda_favorita: string | null
  filme_favorito: string | null
  serie_favorita: string | null
  anime_favorito: string | null
  livro_favorito: string | null
  jogo_favorito: string | null
  hobby_tempo_livre: string | null
  esporte_favorito: string | null
  talento_habilidade: string | null
  maior_sonho: string | null
  lugar_deseja_conhecer: string | null
  objetivo_proximos_anos: string | null
  linguagem_amor: string | null
  como_demonstra_carinho: string | null
  como_gosta_receber_carinho: string | null
  nunca_pode_faltar_relacionamento: string | null
  o_que_considera_traicao: string | null
  encontro_perfeito: string | null
  planos_futuro: string | null
  rotina: string | null
  dorme_cedo_ou_tarde: string | null
  cafe_ou_cha: string | null
  doce_ou_salgado: string | null
  praia_ou_montanha: string | null
  calor_ou_frio: string | null
  animal_favorito: string | null
  flor_favorita: string | null
  perfume_favorito: string | null
  maior_vergonha: string | null
  maior_conquista: string | null
  maior_arrependimento: string | null
  algo_quase_ninguem_sabe: string | null
  primeira_impressao_parceiro: string | null
  momento_favorito_casal: string | null
  o_que_mais_gosta_em_mim: string | null
  gostaria_melhorar_casal: string | null
  sonho_realizar_com_parceiro: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
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
