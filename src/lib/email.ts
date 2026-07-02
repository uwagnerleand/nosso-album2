import { Resend } from 'resend'

// Email do casal para receber notificações
const CASAL_EMAILS = ['lcunhaleandro@gmail.com', 'debgarcia491@gmail.com']

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.warn('[EMAIL] RESEND_API_KEY não configurada. Email não enviado.')
    console.log(`[EMAIL] Para: ${to} | Assunto: ${subject}`)
    return { error: null, data: null }
  }

  const { data, error } = await resend.emails.send({
    from: 'Nosso Álbum <onboarding@resend.dev>',
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  })

  if (error) {
    console.error('[EMAIL] Erro ao enviar:', error)
    return { error, data: null }
  }

  return { data, error: null }
}

/**
 * Envia notificação para o outro membro do casal
 */
export async function notifyCasal(subject: string, html: string) {
  return sendEmail({ to: CASAL_EMAILS, subject, html })
}

// ─── Templates HTML ────────────────────────────────────────

export function templateRecado(remetente: string, mensagem: string) {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #fef9f9; border-radius: 20px; border: 1px solid #fce7f3;">
      <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">💌</div>
      <h2 style="color: #e11d48; text-align: center; margin: 0 0 8px;">Novo Recado no Mural</h2>
      <p style="color: #6b7280; text-align: center; font-size: 14px; margin: 0 0 24px;">
        <strong>${remetente}</strong> deixou um recado especial para você 💕
      </p>
      <div style="background: white; border-radius: 16px; padding: 20px; border: 1px solid #fce7f3; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <p style="color: #374151; font-size: 16px; line-height: 1.6; font-style: italic; margin: 0;">"${mensagem}"</p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/mural"
           style="display: inline-block; background: linear-gradient(135deg, #e11d48, #a855f7); color: white; text-decoration: none; padding: 12px 28px; border-radius: 40px; font-size: 14px; font-weight: 600;">
          Ver no Mural 🖼️
        </a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
        Nosso Álbum — Cada memória é um capítulo da nossa história.
      </p>
    </div>
  `
}

export function templateCapsula(criador: string, titulo: string, dataAbertura: string) {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #fef9f9; border-radius: 20px; border: 1px solid #fde68a;">
      <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">📦</div>
      <h2 style="color: #d97706; text-align: center; margin: 0 0 8px;">Nova Cápsula do Tempo</h2>
      <p style="color: #6b7280; text-align: center; font-size: 14px; margin: 0 0 24px;">
        <strong>${criador}</strong> guardou uma surpresa para o futuro 🎁
      </p>
      <div style="background: white; border-radius: 16px; padding: 20px; border: 1px solid #fde68a; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <h3 style="color: #92400e; margin: 0 0 8px;">${titulo}</h3>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">⏳ Será aberta em <strong>${dataAbertura}</strong></p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/capsula-do-tempo"
           style="display: inline-block; background: linear-gradient(135deg, #d97706, #ea580c); color: white; text-decoration: none; padding: 12px 28px; border-radius: 40px; font-size: 14px; font-weight: 600;">
          Ver Cápsulas 🗝️
        </a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
        Nosso Álbum — Cada memória é um capítulo da nossa história.
      </p>
    </div>
  `
}

export function templateCarta(remetente: string, titulo: string) {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #fef9f9; border-radius: 20px; border: 1px solid #e0e7ff;">
      <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">💌</div>
      <h2 style="color: #6366f1; text-align: center; margin: 0 0 8px;">Você recebeu uma carta</h2>
      <p style="color: #6b7280; text-align: center; font-size: 14px; margin: 0 0 24px;">
        <strong>${remetente}</strong> escreveu algo especial para você ✨
      </p>
      <div style="background: white; border-radius: 16px; padding: 20px; border: 1px solid #e0e7ff; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <h3 style="color: #4338ca; margin: 0; font-size: 18px;">📜 ${titulo}</h3>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cartas"
           style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 12px 28px; border-radius: 40px; font-size: 14px; font-weight: 600;">
          Ler Carta 📖
        </a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
        Nosso Álbum — Cada memória é um capítulo da nossa história.
      </p>
    </div>
  `
}