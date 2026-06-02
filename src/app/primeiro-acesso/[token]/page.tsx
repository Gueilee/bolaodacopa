import { getUserByToken } from '@/lib/token-queries'
import { FirstAccessForm } from './first-access-form'
import Image from 'next/image'
import Link from 'next/link'

type Props = { params: Promise<{ token: string }> }

export default async function PrimeiroAcessoPage({ params }: Props) {
  const { token } = await params
  const data = await getUserByToken(token)

  // ── Token inválido ──
  if (!data || !data.user) {
    return <ErrorScreen message="Link inválido ou expirado." sub="Solicite um novo convite ao RH ou ao organizador do bolão." />
  }

  // ── Já utilizado ──
  if (data.used) {
    return (
      <ErrorScreen
        message="Este link já foi utilizado."
        sub="Você já criou sua senha. Acesse o sistema normalmente."
        cta={{ href: '/login', label: 'Ir para o login' }}
      />
    )
  }

  // ── Expirado ──
  if (data.expired) {
    return <ErrorScreen message="Link expirado." sub="Este link era válido por 7 dias. Solicite um novo convite." />
  }

  // ── Já fez primeiro acesso ──
  if (data.user.firstAccessAt) {
    return (
      <ErrorScreen
        message="Você já tem acesso ao sistema."
        sub="Faça login com seu e-mail e a senha que você criou."
        cta={{ href: '/login', label: 'Ir para o login' }}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ef', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image
            src="/vendemmia-logo.png"
            alt="Vendemmia"
            width={160} height={54}
            unoptimized
            style={{ objectFit: 'contain', height: 44, width: 'auto', margin: '0 auto' }}
          />
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e8e4df', overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>

          {/* Header roxo */}
          <div style={{ background: 'linear-gradient(135deg,#422c76,#2a1a4e)', padding: '28px 32px' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#01E18E', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              ⚽ Bolão Copa 2026
            </p>
            <h1 style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
              Criar minha senha
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
              Olá, <strong style={{ color: '#fff' }}>{data.user.name.split(' ')[0]}</strong>! Defina sua senha para acessar o bolão.
            </p>
          </div>

          {/* Formulário */}
          <div style={{ padding: '32px' }}>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#8a8490' }}>
              Login: <strong style={{ color: '#1a1625' }}>{data.user.email}</strong>
            </p>

            <FirstAccessForm token={token} />
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#aaa8b0' }}>
          Já tem senha?{' '}
          <Link href="/login" style={{ color: '#422c76', fontWeight: 600, textDecoration: 'none' }}>
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}

function ErrorScreen({ message, sub, cta }: { message: string; sub: string; cta?: { href: string; label: string } }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ef', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <span style={{ fontSize: 56 }}>🔒</span>
        <h2 style={{ margin: '16px 0 8px', fontSize: 20, fontWeight: 800, color: '#1a1625' }}>{message}</h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#8a8490', lineHeight: 1.6 }}>{sub}</p>
        {cta && (
          <Link href={cta.href}
            style={{ display: 'inline-block', background: '#422c76', color: '#fff', borderRadius: 12, padding: '12px 28px', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
            {cta.label}
          </Link>
        )}
        {!cta && (
          <Link href="/login"
            style={{ fontSize: 13, color: '#422c76', fontWeight: 600, textDecoration: 'none' }}>
            ← Voltar ao login
          </Link>
        )}
      </div>
    </div>
  )
}
