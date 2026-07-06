'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Edit2, Save, User, Camera, Users, Baby, Sparkles, Star, Trophy, Brain, Palette, Music, Gamepad2, Sunrise, Compass, HeartHandshake, Clock, HelpCircle, Coffee, Flame, BookHeart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUserEmail } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { PartnerProfile } from '@/types'
import toast from 'react-hot-toast'

// ============================================================
// SECTION DEFINITIONS
// ============================================================

interface FieldDef {
  key: keyof PartnerProfile
  label: string
  type?: 'text' | 'textarea'
  placeholder?: string
}

interface SectionDef {
  id: string
  title: string
  icon: React.ReactNode
  fields: FieldDef[]
}

const sections: SectionDef[] = [
  {
    id: 'identidade',
    title: 'Identidade',
    icon: <User className="w-5 h-5 text-rose-400" />,
    fields: [
      { key: 'nome_completo', label: 'Nome completo', placeholder: 'Seu nome completo' },
      { key: 'como_gosta_de_ser_chamado', label: 'Como gosta de ser chamado(a)', placeholder: 'Apelido ou como prefere' },
      { key: 'data_nascimento', label: 'Data de nascimento', placeholder: 'DD/MM/AAAA' },
      { key: 'cidade_nasceu', label: 'Cidade onde nasceu', placeholder: 'Cidade de nascimento' },
    ],
  },
  {
    id: 'familia',
    title: 'Família',
    icon: <Users className="w-5 h-5 text-purple-400" />,
    fields: [
      { key: 'quem_faz_parte_familia', label: 'Quem faz parte da família', type: 'textarea', placeholder: 'Conte um pouco sobre sua família' },
      { key: 'relacao_com_familia', label: 'Como é a relação com a família', type: 'textarea', placeholder: 'Descreva sua relação familiar' },
      { key: 'pessoas_importantes_vida', label: 'Pessoas mais importantes da vida', type: 'textarea', placeholder: 'Quem são as pessoas mais importantes para você' },
    ],
  },
  {
    id: 'infancia',
    title: 'Infância',
    icon: <Baby className="w-5 h-5 text-pink-400" />,
    fields: [
      { key: 'melhor_lembranca_infancia', label: 'Melhor lembrança da infância', type: 'textarea', placeholder: 'Qual sua melhor recordação?' },
      { key: 'sonho_crianca', label: 'Sonho de criança', placeholder: 'O que você sonhava ser quando crescer?' },
      { key: 'desenho_brincadeira_favorita', label: 'Desenho ou brincadeira favorita', placeholder: 'Qual era seu favorito?' },
      { key: 'medo_crianca', label: 'Medo quando era criança', placeholder: 'Do que você tinha medo?' },
    ],
  },
  {
    id: 'personalidade',
    title: 'Personalidade',
    icon: <Brain className="w-5 h-5 text-blue-400" />,
    fields: [
      { key: 'tres_qualidades', label: 'Três qualidades', type: 'textarea', placeholder: 'Suas três principais qualidades' },
      { key: 'tres_defeitos', label: 'Três defeitos', type: 'textarea', placeholder: 'Seus três principais defeitos' },
      { key: 'maior_medo_atualmente', label: 'Maior medo atualmente', type: 'textarea', placeholder: 'Qual seu maior medo hoje?' },
      { key: 'o_que_mais_irrita', label: 'O que mais irrita', placeholder: 'O que te tira do sério?' },
      { key: 'o_que_mais_deixa_feliz', label: 'O que mais deixa feliz', type: 'textarea', placeholder: 'O que te faz mais feliz?' },
      { key: 'como_gosta_resolver_conflitos', label: 'Como gosta de resolver conflitos', type: 'textarea', placeholder: 'Qual sua abordagem?' },
    ],
  },
  {
    id: 'gostos',
    title: 'Gostos',
    icon: <Heart className="w-5 h-5 text-rose-400" />,
    fields: [
      { key: 'cor_favorita', label: 'Cor favorita', placeholder: 'Ex: Azul' },
      { key: 'comida_favorita', label: 'Comida favorita', placeholder: 'Ex: Pizza' },
      { key: 'bebida_favorita', label: 'Bebida favorita', placeholder: 'Ex: Suco' },
      { key: 'musica_favorita', label: 'Música favorita', placeholder: 'Ex: "Perfect" - Ed Sheeran' },
      { key: 'artista_banda_favorita', label: 'Artista ou banda favorita', placeholder: 'Ex: Ed Sheeran' },
      { key: 'filme_favorito', label: 'Filme favorito', placeholder: 'Ex: Diário de uma Paixão' },
      { key: 'serie_favorita', label: 'Série favorita', placeholder: 'Ex: Friends' },
      { key: 'anime_favorito', label: 'Anime favorito (se assistir)', placeholder: 'Ex: Naruto' },
      { key: 'livro_favorito', label: 'Livro favorito', placeholder: 'Ex: O Pequeno Príncipe' },
      { key: 'jogo_favorito', label: 'Jogo favorito (se jogar)', placeholder: 'Ex: Minecraft' },
    ],
  },
  {
    id: 'hobbies',
    title: 'Hobbies',
    icon: <Gamepad2 className="w-5 h-5 text-green-400" />,
    fields: [
      { key: 'hobby_tempo_livre', label: 'O que gosta de fazer no tempo livre', type: 'textarea', placeholder: 'Seus hobbies' },
      { key: 'esporte_favorito', label: 'Esporte favorito', placeholder: 'Ex: Futebol' },
      { key: 'talento_habilidade', label: 'Talento ou habilidade', placeholder: 'Ex: Tocar violão' },
    ],
  },
  {
    id: 'sonhos',
    title: 'Sonhos',
    icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
    fields: [
      { key: 'maior_sonho', label: 'Maior sonho', type: 'textarea', placeholder: 'Qual seu maior sonho?' },
      { key: 'lugar_deseja_conhecer', label: 'Lugar que deseja conhecer', placeholder: 'Ex: Paris' },
      { key: 'objetivo_proximos_anos', label: 'Objetivo para os próximos anos', type: 'textarea', placeholder: 'O que deseja alcançar?' },
    ],
  },
  {
    id: 'relacionamento',
    title: 'Relacionamento',
    icon: <HeartHandshake className="w-5 h-5 text-red-400" />,
    fields: [
      { key: 'linguagem_amor', label: 'Linguagem do amor', placeholder: 'Ex: Toque físico, palavras de afirmação...' },
      { key: 'como_demonstra_carinho', label: 'Como demonstra carinho', type: 'textarea', placeholder: 'Como você demonstra que ama?' },
      { key: 'como_gosta_receber_carinho', label: 'Como gosta de receber carinho', type: 'textarea', placeholder: 'Como você se sente amado(a)?' },
      { key: 'nunca_pode_faltar_relacionamento', label: 'O que nunca pode faltar em um relacionamento', type: 'textarea', placeholder: 'O que é essencial?' },
      { key: 'o_que_considera_traicao', label: 'O que considera uma traição', type: 'textarea', placeholder: 'Seus limites' },
      { key: 'encontro_perfeito', label: 'O encontro perfeito', type: 'textarea', placeholder: 'Descreva o encontro dos sonhos' },
      { key: 'planos_futuro', label: 'Planos para o futuro (casamento, filhos, etc.)', type: 'textarea', placeholder: 'O que você planeja?' },
    ],
  },
  {
    id: 'dia-a-dia',
    title: 'Dia a Dia',
    icon: <Sunrise className="w-5 h-5 text-orange-400" />,
    fields: [
      { key: 'rotina', label: 'Rotina', type: 'textarea', placeholder: 'Como é seu dia típico?' },
      { key: 'dorme_cedo_ou_tarde', label: 'Dorme cedo ou tarde?', placeholder: 'Ex: Cedo, por volta das 22h' },
      { key: 'cafe_ou_cha', label: 'Café ou chá?', placeholder: 'Ex: Café, bem forte' },
      { key: 'doce_ou_salgado', label: 'Doce ou salgado?', placeholder: 'Ex: Salgado' },
      { key: 'praia_ou_montanha', label: 'Praia ou montanha?', placeholder: 'Ex: Montanha' },
      { key: 'calor_ou_frio', label: 'Calor ou frio?', placeholder: 'Ex: Frio' },
    ],
  },
  {
    id: 'curiosidades',
    title: 'Curiosidades',
    icon: <HelpCircle className="w-5 h-5 text-teal-400" />,
    fields: [
      { key: 'animal_favorito', label: 'Animal favorito', placeholder: 'Ex: Cachorro' },
      { key: 'flor_favorita', label: 'Flor favorita', placeholder: 'Ex: Rosa' },
      { key: 'perfume_favorito', label: 'Perfume favorito', placeholder: 'Ex: Quem sabe?' },
      { key: 'maior_vergonha', label: 'Maior vergonha que já passou', type: 'textarea', placeholder: 'Aquela situação constrangedora...' },
      { key: 'maior_conquista', label: 'Maior conquista', type: 'textarea', placeholder: 'Do que você mais se orgulha?' },
      { key: 'maior_arrependimento', label: 'Maior arrependimento', type: 'textarea', placeholder: 'O que você faria diferente?' },
      { key: 'algo_quase_ninguem_sabe', label: 'Algo que quase ninguém sabe sobre você', type: 'textarea', placeholder: 'Conte um segredo' },
    ],
  },
  {
    id: 'sobre-voces',
    title: 'Sobre Vocês',
    icon: <BookHeart className="w-5 h-5 text-pink-400" />,
    fields: [
      { key: 'primeira_impressao_parceiro', label: 'Como foi a primeira impressão de mim', type: 'textarea', placeholder: 'O que você pensou quando me viu pela primeira vez?' },
      { key: 'momento_favorito_casal', label: 'Qual momento nosso é o favorito', type: 'textarea', placeholder: 'Qual momento você mais guarda no coração?' },
      { key: 'o_que_mais_gosta_em_mim', label: 'O que mais gosta em mim', type: 'textarea', placeholder: 'O que você mais ama em mim?' },
      { key: 'gostaria_melhorar_casal', label: 'O que gostaria que melhorássemos como casal', type: 'textarea', placeholder: 'Como podemos crescer juntos?' },
      { key: 'sonho_realizar_com_parceiro', label: 'Qual sonho gostaria de realizar comigo', type: 'textarea', placeholder: 'O que você sonha fazer comigo?' },
    ],
  },
]

// ============================================================
// PAGE COMPONENT
// ============================================================

export default function ConhecaSeuParceiroPage() {
  const supabase = createClient()
  const { user: storeUser } = useAppStore()

  const [myProfile, setMyProfile] = useState<Partial<PartnerProfile>>({})
  const [partnerProfile, setPartnerProfile] = useState<Partial<PartnerProfile>>({})
  const [myEmail, setMyEmail] = useState<string | null>(null)
  const [partnerEmail, setPartnerEmail] = useState<string | null>(null)
  const [isPartner, setIsPartner] = useState<'wagner' | 'debora' | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savingSection, setSavingSection] = useState<string | null>(null)

  useEffect(() => {
    const email = getCurrentUserEmail()
    if (!email) return
    setMyEmail(email)

    // Determine who is who
    if (email === 'lcunhaleandro@gmail.com') {
      setIsPartner('wagner')
      setPartnerEmail('debgarcia491@gmail.com')
    } else {
      setIsPartner('debora')
      setPartnerEmail('lcunhaleandro@gmail.com')
    }

    loadProfiles(email)
  }, [])

  async function loadProfiles(email: string) {
    const partnerEm = email === 'lcunhaleandro@gmail.com' ? 'debgarcia491@gmail.com' : 'lcunhaleandro@gmail.com'

    // Load my profile
    const { data: myData } = await supabase
      .from('partner_profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (myData) setMyProfile(myData as Partial<PartnerProfile>)

    // Load partner's profile
    const { data: partnerData } = await supabase
      .from('partner_profiles')
      .select('*')
      .eq('email', partnerEm)
      .single()

    if (partnerData) setPartnerProfile(partnerData as Partial<PartnerProfile>)
  }

  function handleMyFieldChange(key: keyof PartnerProfile, value: string) {
    setMyProfile(prev => ({ ...prev, [key]: value }))
  }

  async function handleSaveSection(sectionId: string, fields: FieldDef[]) {
    if (!myEmail) return
    setSavingSection(sectionId)

    const updateData: Record<string, string | null> = {}
    for (const field of fields) {
      updateData[field.key] = (myProfile[field.key] as string) ?? null
    }

    const { error } = await supabase
      .from('partner_profiles')
      .upsert({ email: myEmail, ...updateData })
      .eq('email', myEmail)

    if (error) {
      toast.error(`Erro ao salvar: ${error.message}`)
    } else {
      toast.success('Salvo com sucesso! ✨')
    }

    setSavingSection(null)
  }

  async function handleSaveAll() {
    if (!myEmail) return
    setLoading(true)

    // Extract all field keys from all sections
    const allFields = sections.flatMap(s => s.fields)
    const updateData: Record<string, string | null> = { email: myEmail }
    for (const field of allFields) {
      updateData[field.key] = (myProfile[field.key] as string) ?? null
    }

    const { error } = await supabase
      .from('partner_profiles')
      .upsert(updateData)

    if (error) {
      toast.error(`Erro ao salvar: ${error.message}`)
    } else {
      toast.success('Tudo salvo! ✨')
      setEditing(false)
    }

    setLoading(false)
  }

  // Get display name for the current user
  const myName = isPartner === 'wagner' ? 'Wagner' : 'Débora'
  const partnerName = isPartner === 'wagner' ? 'Débora' : 'Wagner'

  const initials = (myProfile.nome_completo ?? myEmail ?? '?').slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Conheça seu Parceiro"
        subtitle="Descubra tudo sobre quem está ao seu lado ❤️"
      />

      <div className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center relative"
        >
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* Me */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-rose-500/30">
                {initials}
              </div>
              <p className="text-sm font-medium mt-2">Você ({myName})</p>
              {editing && <p className="text-xs text-rose-400">✏️ Editando</p>}
            </div>

            <Heart className="w-8 h-8 text-rose-400 fill-rose-400" />

            {/* Partner avatar */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-purple-500/30">
                {partnerName[0]}
              </div>
              <p className="text-sm font-medium mt-2">{partnerName}</p>
              {!editing && <p className="text-xs text-purple-400">👀 Visualizando</p>}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
            {editing
              ? `Preencha as informações sobre você. ${partnerName} poderá ver tudo o que você escrever.`
              : `Veja o que ${partnerName} escreveu sobre si. Você pode editar apenas suas próprias informações.`
            }
          </p>

          <div className="flex justify-center gap-3 mt-4">
            <Button
              variant={editing ? 'gradient' : 'glass'}
              size="sm"
              onClick={() => {
                if (editing) {
                  handleSaveAll()
                } else {
                  setEditing(true)
                }
              }}
              loading={loading}
            >
              {editing ? <><Save className="w-4 h-4" /> Salvar Tudo</> : <><Edit2 className="w-4 h-4" /> Editar Meu Perfil</>}
            </Button>
            {editing && (
              <Button variant="ghost" size="sm" onClick={() => {
                setEditing(false)
                if (myEmail) loadProfiles(myEmail)
              }}>
                Cancelar
              </Button>
            )}
          </div>
        </motion.div>

        {/* Sections */}
        {sections.map((section, idx) => {
          const isEditingSection = editing
          const dataSource = isEditingSection ? myProfile : partnerProfile

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-5"
            >
              {/* Section header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
                <div className="flex items-center gap-2">
                  {section.icon}
                  <h3 className="font-semibold">{section.title}</h3>
                </div>

                {isEditingSection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveSection(section.id, section.fields)}
                    loading={savingSection === section.id}
                    className="text-xs"
                  >
                    <Save className="w-3 h-3" />
                    Salvar seção
                  </Button>
                )}
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.fields.map((field) => {
                  const value = isEditingSection
                    ? (myProfile[field.key] as string) ?? ''
                    : (dataSource[field.key] as string)

                  return (
                    <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                      <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
                      {isEditingSection ? (
                        field.type === 'textarea' ? (
                          <textarea
                            value={value}
                            onChange={e => handleMyFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder ?? ''}
                            className="w-full min-h-[60px] rounded-xl border border-input bg-background/50 px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                          />
                        ) : (
                          <Input
                            type="text"
                            placeholder={field.placeholder ?? ''}
                            value={value}
                            onChange={e => handleMyFieldChange(field.key, e.target.value)}
                          />
                        )
                      ) : (
                        <p className="text-sm py-2 px-3 rounded-xl bg-muted/30 min-h-[40px] flex items-center">
                          {value ? (
                            value
                          ) : (
                            <span className="text-muted-foreground italic">Não respondido</span>
                          )}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}

        {/* Bottom info */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            Conhecendo cada vez mais um ao outro
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
          </p>
        </div>
      </div>
    </div>
  )
}