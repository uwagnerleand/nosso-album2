/**
 * Sistema de autenticação simples baseado em cookie/localStorage
 * Não depende do Supabase Auth - validação 100% local
 */

const SESSION_COOKIE = 'nosso-album-session'
const ALLOWED_EMAILS = ['lcunhaleandro@gmail.com', 'debgarcia491@gmail.com']
const CORRECT_PASSWORD = 'roxo&vermelho'

export interface AuthSession {
  email: string
  name: string
  loggedInAt: number
}

export function validateCredentials(email: string, password: string): { valid: boolean; error?: string; session?: AuthSession } {
  if (!email || !password) {
    return { valid: false, error: 'Preencha todos os campos' }
  }

  const normalizedEmail = email.toLowerCase().trim()

  if (!ALLOWED_EMAILS.includes(normalizedEmail)) {
    return { valid: false, error: 'Email não autorizado. Acesso exclusivo para o casal.' }
  }

  if (password !== CORRECT_PASSWORD) {
    return { valid: false, error: 'Senha incorreta' }
  }

  const name = normalizedEmail === 'lcunhaleandro@gmail.com' ? 'Leandro' : 'Débora'

  return {
    valid: true,
    session: {
      email: normalizedEmail,
      name,
      loggedInAt: Date.now(),
    },
  }
}

export function saveSession(session: AuthSession): void {
  if (typeof window !== 'undefined') {
    document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
    localStorage.setItem(SESSION_COOKIE, JSON.stringify(session))
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null

  // Try cookie first
  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [key, ...val] = cookie.split('=')
    acc[key] = val.join('=')
    return acc
  }, {} as Record<string, string>)

  if (cookies[SESSION_COOKIE]) {
    try {
      return JSON.parse(decodeURIComponent(cookies[SESSION_COOKIE]))
    } catch {}
  }

  // Fallback to localStorage
  const stored = localStorage.getItem(SESSION_COOKIE)
  if (stored) {
    try {
      const session = JSON.parse(stored) as AuthSession
      // Restore cookie from localStorage
      document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(stored)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
      return session
    } catch {}
  }

  return null
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`
    localStorage.removeItem(SESSION_COOKIE)
  }
}

export function isLoggedIn(): boolean {
  return getSession() !== null
}

export function requireAuth(redirectTo = '/login'): AuthSession {
  const session = getSession()
  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo
    }
    throw new Error('Not authenticated')
  }
  return session
}