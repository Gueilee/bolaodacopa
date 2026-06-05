'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ── Countdown ────────────────────────────────────────────────────────────────

const FIRST_MATCH = new Date('2026-06-11T20:00:00Z')

function useCountdown(target: Date) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, mounted: false })
  useEffect(() => {
    function calc() {
      const diff = target.getTime() - Date.now()
      if (diff <= 0) { setT({ days: 0, hours: 0, minutes: 0, seconds: 0, mounted: true }); return }
      setT({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        mounted: true,
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [target])
  return t
}

function CdBlock({ value, label }: { value: number; label: string }) {
  const digits = String(value).padStart(2, '0').split('')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {digits.map((d, i) => (
          <div key={i} style={{
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: 'clamp(2rem, 5.5vw, 3.6rem)',
            lineHeight: 1,
            color: '#01E18E',
            background: 'rgba(1,225,142,0.07)',
            border: '1px solid rgba(1,225,142,0.22)',
            padding: '0.45rem 0.65rem',
            minWidth: '1.8ch',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {d}
            {/* LCD scanline */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)',
            }} />
          </div>
        ))}
      </div>
      <span style={{
        fontFamily: 'var(--font-barlow), sans-serif',
        fontSize: '0.6rem', fontWeight: 700,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
      }}>{label}</span>
    </div>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  { num: '01', icon: '🏅', title: 'Ranking',    color: '#F2C12E', href: '/login', cta: 'Ver ranking',    desc: 'Acompanhe sua posição em tempo real. Veja quem lidera e quanto falta para o topo.' },
  { num: '02', icon: '⚽', title: 'Palpites',   color: '#01E18E', href: '/login', cta: 'Fazer palpites', desc: 'Preveja placares de todos os 64 jogos. Acerto exato vale pontos dobrados.' },
  { num: '03', icon: '🎁', title: 'Prêmios',    color: '#ff2f69', href: '/login', cta: 'Ver prêmios',    desc: 'Os melhores colocados dividem o prêmio total. Valeu cada palpite certeiro!' },
  { num: '04', icon: '📋', title: 'Como Jogar', color: '#a78bfa', href: '/login', cta: 'Ver regras',     desc: 'Regras simples e pontuação transparente. Auditado para o melhor vencer.' },
]

const STEPS = [
  { n: '1', title: 'Cadastre-se',   desc: 'Acesse com seu e-mail corporativo Vendemmia e confirme sua participação.' },
  { n: '2', title: 'Pague a Taxa',  desc: 'R$ 50 vão direto para o fundo de prêmios. Sem desconto.' },
  { n: '3', title: 'Faça Palpites', desc: 'Registre antes de cada rodada. Acerto exato vale mais pontos.' },
  { n: '4', title: 'Ganhe! 🏆',     desc: 'O campeão do bolão leva o troféu e o prêmio total.' },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const cd = useCountdown(FIRST_MATCH)
  const [hovCard, setHovCard] = useState<number | null>(null)
  const [hovStep, setHovStep] = useState<number | null>(null)

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hp-root {
          background: #03010F;
          color: #EEEAE0;
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* grain */
        .hp-grain {
          position: fixed; inset: -50%; width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
          opacity: 0.4; pointer-events: none; z-index: 9998;
          animation: grain 8s steps(10) infinite;
        }
        @keyframes grain {
          0%,100%{transform:translate(0,0)} 10%{transform:translate(-1%,-1%)}
          30%{transform:translate(1%,-2%)} 50%{transform:translate(-2%,1%)}
          70%{transform:translate(2%,2%)} 90%{transform:translate(-1%,2%)}
        }

        /* entrance anims */
        @keyframes fadeInUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        .anim-1 { animation: fadeInDown .7s .1s both }
        .anim-2 { animation: fadeInUp .7s .15s both }
        .anim-3 { animation: fadeInUp .7s .3s both }
        .anim-4 { animation: fadeInUp .7s .45s both }
        .anim-5 { animation: fadeInUp .7s .6s both }

        /* trophy float */
        @keyframes trophyFloat {
          0%,100% { transform: translateY(0);   filter: drop-shadow(0 0 30px rgba(242,193,46,.5)) drop-shadow(0 0 60px rgba(242,193,46,.25)); }
          50%      { transform: translateY(-12px); filter: drop-shadow(0 12px 45px rgba(242,193,46,.75)) drop-shadow(0 0 90px rgba(242,193,46,.35)); }
        }
        .trophy-float { animation: trophyFloat 4s ease-in-out infinite; }

        /* blink separator */
        @keyframes blink { 0%,100%{opacity:.35} 50%{opacity:.08} }
        .cd-blink { animation: blink 1s step-end infinite; }

        /* hero spotlight rays */
        .hero-rays {
          position: absolute; top: -20%; left: 50%; transform: translateX(-50%);
          width: 200%; height: 120%; pointer-events: none;
          background: conic-gradient(
            from 258deg at 50% 0%,
            transparent 0deg,
            rgba(1,225,142,.04) 7deg, transparent 13deg,
            transparent 28deg,
            rgba(66,44,118,.07) 34deg, transparent 40deg,
            transparent 58deg,
            rgba(1,225,142,.025) 63deg, transparent 69deg,
            transparent 91deg,
            rgba(66,44,118,.05) 97deg, transparent 103deg
          );
        }

        /* pitch rings */
        .pitch-ring {
          position: absolute; border-radius: 50%;
          border: 1px solid rgba(1,225,142,.07); pointer-events: none;
        }

        /* shimmer button */
        .shimmer-btn { position: relative; overflow: hidden; }
        .shimmer-btn::after {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%; transform: skewX(-15deg);
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);
          transition: left .5s;
        }
        .shimmer-btn:hover::after { left: 150%; }

        /* feature card hover line */
        .feat-top-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          transform-origin: left;
          transition: transform .4s;
        }

        @media (max-width: 900px) {
          .feature-grid { grid-template-columns: 1fr 1fr !important; }
          .steps-grid   { grid-template-columns: 1fr 1fr !important; }
          .steps-line   { display: none !important; }
        }
        @media (max-width: 600px) {
          .feature-grid { grid-template-columns: 1fr !important; }
          .steps-grid   { grid-template-columns: 1fr !important; }
          .stats-row    { flex-direction: column !important; }
          .stat-divider { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,.07) !important; padding: 1.5rem 0 !important; }
          .nav-extra    { display: none !important; }
        }
      `}</style>

      <div className="hp-root">
        <div className="hp-grain" />

        {/* ── NAV ── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.2rem 2rem',
          background: 'linear-gradient(to bottom, rgba(3,1,15,.96) 0%, transparent 100%)',
        }}>
          <div style={{
            fontFamily: 'var(--font-barlow), sans-serif',
            fontWeight: 700, fontSize: '.9rem',
            letterSpacing: '.1em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>⚽</span>
            <span style={{ color: 'rgba(255,255,255,.35)' }}>Vendemmia</span>
            <span style={{ color: 'rgba(255,255,255,.18)' }}>/</span>
            <span style={{ color: '#01E18E' }}>Bolão 2026</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/login" className="nav-extra" style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontWeight: 600, fontSize: '.8rem',
              letterSpacing: '.12em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,.4)', textDecoration: 'none',
              padding: '.45rem .9rem', transition: 'color .2s',
            }}>Entrar</Link>
            <Link href="/login" className="shimmer-btn" style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontWeight: 800, fontSize: '.82rem',
              letterSpacing: '.12em', textTransform: 'uppercase',
              color: '#0f0d17', background: '#01E18E',
              textDecoration: 'none', padding: '.5rem 1.3rem',
              borderRadius: 7,
              boxShadow: '0 0 18px rgba(1,225,142,.35)',
            }}>Participar</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{
          position: 'relative', minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '7rem 2rem 5rem', overflow: 'hidden', textAlign: 'center',
          background: 'radial-gradient(ellipse 130% 80% at 50% -5%, rgba(66,44,118,.38) 0%, #03010F 62%)',
        }}>
          <div className="hero-rays" />
          {/* outer ring */}
          <div className="pitch-ring" style={{
            bottom: '-52%', left: '50%', transform: 'translateX(-50%)',
            width: 820, height: 820,
            boxShadow: '0 0 0 48px rgba(1,225,142,.025), 0 0 0 100px rgba(1,225,142,.012)',
          }} />
          {/* center circle */}
          <div className="pitch-ring" style={{
            bottom: '-52%', left: '50%', transform: 'translateX(-50%)',
            width: 260, height: 260,
          }} />

          {/* host nations */}
          <div className="anim-1" style={{
            position: 'absolute', top: '5.5rem',
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: 'var(--font-barlow), sans-serif',
            fontSize: '.68rem', fontWeight: 700,
            letterSpacing: '.2em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,.32)',
          }}>
            <span style={{ fontSize: '1.05rem' }}>🇺🇸</span> <span>USA</span>
            <span style={{ color: 'rgba(255,255,255,.12)' }}>·</span>
            <span style={{ fontSize: '1.05rem' }}>🇨🇦</span> <span>Canadá</span>
            <span style={{ color: 'rgba(255,255,255,.12)' }}>·</span>
            <span style={{ fontSize: '1.05rem' }}>🇲🇽</span> <span>México</span>
          </div>

          {/* trophy */}
          <div className="trophy-float anim-2" style={{
            fontSize: 'clamp(3.5rem, 8vw, 5rem)', lineHeight: 1,
            marginBottom: '.85rem',
          }}>🏆</div>

          {/* title */}
          <h1 className="anim-2" style={{
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: 'clamp(3.6rem, 14vw, 9.5rem)',
            lineHeight: .9, letterSpacing: '.01em', textTransform: 'uppercase',
            marginBottom: '.5rem',
          }}>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-barlow), sans-serif',
              fontSize: 'clamp(.85rem, 2.2vw, 1.2rem)',
              fontWeight: 700, letterSpacing: '.45em',
              color: 'rgba(255,255,255,.28)', marginBottom: '.6rem',
            }}>Copa do Mundo</span>
            <span style={{ color: '#01E18E' }}>Bolão</span>
            <br />
            <span style={{ color: 'rgba(238,234,224,.88)' }}>2026</span>
          </h1>

          <p className="anim-3" style={{
            fontFamily: 'var(--font-barlow), sans-serif',
            fontSize: 'clamp(.78rem, 1.8vw, 1rem)',
            fontWeight: 500, letterSpacing: '.22em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,.3)', marginBottom: '2.75rem',
          }}>
            Palpites · Ranking · Prêmios · Vendemmia
          </p>

          {/* countdown */}
          <div className="anim-4" style={{ marginBottom: '3rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              justifyContent: 'center', marginBottom: '.8rem',
              fontFamily: 'var(--font-barlow), sans-serif',
              fontSize: '.62rem', fontWeight: 700,
              letterSpacing: '.28em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,.22)',
            }}>
              <div style={{ width: '2rem', height: 1, background: 'rgba(1,225,142,.3)' }} />
              Primeiro jogo em
              <div style={{ width: '2rem', height: 1, background: 'rgba(1,225,142,.3)' }} />
            </div>
            {cd.mounted ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, justifyContent: 'center' }}>
                <CdBlock value={cd.days}    label="dias" />
                <div className="cd-blink" style={{
                  fontFamily: 'var(--font-anton), sans-serif',
                  fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
                  color: '#01E18E', paddingBottom: '1.5rem', lineHeight: 1,
                }}>:</div>
                <CdBlock value={cd.hours}   label="horas" />
                <div className="cd-blink" style={{
                  fontFamily: 'var(--font-anton), sans-serif',
                  fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
                  color: '#01E18E', paddingBottom: '1.5rem', lineHeight: 1,
                }}>:</div>
                <CdBlock value={cd.minutes} label="min" />
                <div className="cd-blink" style={{
                  fontFamily: 'var(--font-anton), sans-serif',
                  fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
                  color: '#01E18E', paddingBottom: '1.5rem', lineHeight: 1,
                }}>:</div>
                <CdBlock value={cd.seconds} label="seg" />
              </div>
            ) : (
              <div style={{ height: 90 }} />
            )}
          </div>

          {/* CTAs */}
          <div className="anim-5" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/login" className="shimmer-btn" style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontWeight: 800, fontSize: '1rem',
              letterSpacing: '.15em', textTransform: 'uppercase',
              color: '#0f0d17', background: '#01E18E',
              textDecoration: 'none', padding: '.9rem 2.5rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 40px rgba(1,225,142,.42), 0 4px 24px rgba(0,0,0,.5)',
              transition: 'transform .2s, box-shadow .2s',
            }}>
              ⚽ Fazer Palpites
            </Link>
            <Link href="/login" style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontWeight: 700, fontSize: '1rem',
              letterSpacing: '.15em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,.65)',
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.14)',
              textDecoration: 'none', padding: '.9rem 2.5rem',
              display: 'inline-flex', alignItems: 'center',
              transition: 'all .2s',
            }}>
              Ver Ranking
            </Link>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <div style={{
          background: '#0D0A20',
          borderTop: '1px solid rgba(1,225,142,.1)',
          borderBottom: '1px solid rgba(1,225,142,.1)',
        }}>
          <div className="stats-row" style={{
            maxWidth: 880, margin: '0 auto', padding: '0 2rem',
            display: 'flex', alignItems: 'stretch',
          }}>
            {([
              { icon: '👥', num: '48',      label: 'Participantes', color: '#01E18E' },
              { icon: '🏅', num: 'R$2.400', label: 'Em Prêmios',    color: '#F2C12E' },
              { icon: '📅', num: '64',      label: 'Jogos',         color: '#ff2f69' },
            ] as const).map((s, i) => (
              <div key={i} className="stat-divider" style={{
                flex: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 14,
                padding: '1.75rem 1.5rem',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,.07)' : 'none',
              }}>
                <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-anton), sans-serif',
                    fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
                    lineHeight: 1, color: s.color,
                  }}>{s.num}</div>
                  <div style={{
                    fontFamily: 'var(--font-barlow), sans-serif',
                    fontSize: '.62rem', fontWeight: 700,
                    letterSpacing: '.2em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,.28)', marginTop: 3,
                  }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontSize: '.68rem', fontWeight: 700,
              letterSpacing: '.3em', textTransform: 'uppercase',
              color: '#01E18E', marginBottom: '.6rem',
            }}>Funcionalidades</div>
            <h2 style={{
              fontFamily: 'var(--font-anton), sans-serif',
              fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
              lineHeight: .92, textTransform: 'uppercase', marginBottom: '.75rem',
            }}>
              Tudo que você<br />precisa pra vencer
            </h2>
            <p style={{
              fontSize: '1rem', color: 'rgba(255,255,255,.38)',
              maxWidth: 460, lineHeight: 1.65,
            }}>
              Um bolão completo com ranking em tempo real, palpites por jogo e premiação para os melhores colocados.
            </p>
          </div>

          <div className="feature-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1, background: 'rgba(255,255,255,.055)',
            border: '1px solid rgba(255,255,255,.055)',
          }}>
            {FEATURES.map((f, i) => (
              <Link key={i} href={f.href}
                onMouseEnter={() => setHovCard(i)}
                onMouseLeave={() => setHovCard(null)}
                style={{
                  display: 'block', textDecoration: 'none',
                  background: hovCard === i ? '#12102A' : '#0D0A20',
                  padding: '2.5rem 1.75rem',
                  position: 'relative', overflow: 'hidden',
                  transition: 'background .3s',
                  cursor: 'pointer',
                }}
              >
                <div className="feat-top-bar" style={{
                  background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
                  transform: `scaleX(${hovCard === i ? 1 : 0})`,
                }} />
                {/* ghost number */}
                <div style={{
                  position: 'absolute', top: '.9rem', right: '1.2rem',
                  fontFamily: 'var(--font-anton), sans-serif',
                  fontSize: '5rem', lineHeight: 1,
                  color: 'rgba(255,255,255,.04)',
                  transform: hovCard === i ? 'scale(1.1) translateX(4px)' : 'none',
                  transition: 'transform .4s',
                }}>{f.num}</div>

                <span style={{
                  fontSize: '2rem', display: 'block', marginBottom: '1.2rem',
                  transition: 'transform .3s',
                  transform: hovCard === i ? 'scale(1.15)' : 'none',
                }}>{f.icon}</span>
                <h3 style={{
                  fontFamily: 'var(--font-barlow), sans-serif',
                  fontSize: '1.4rem', fontWeight: 700,
                  letterSpacing: '.06em', textTransform: 'uppercase',
                  color: '#fff', marginBottom: '.6rem',
                }}>{f.title}</h3>
                <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.38)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--font-barlow), sans-serif',
                  fontSize: '.78rem', fontWeight: 700,
                  letterSpacing: '.15em', textTransform: 'uppercase',
                  color: f.color, marginTop: '1.5rem',
                  opacity: hovCard === i ? 1 : 0,
                  transform: hovCard === i ? 'translateX(0)' : 'translateX(-8px)',
                  transition: 'all .3s',
                }}>
                  {f.cta} →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{
          padding: '6rem 2rem',
          background: '#0D0A20',
          borderTop: '1px solid rgba(255,255,255,.05)',
          borderBottom: '1px solid rgba(255,255,255,.05)',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontSize: '.68rem', fontWeight: 700,
              letterSpacing: '.3em', textTransform: 'uppercase',
              color: '#01E18E', marginBottom: '.6rem',
            }}>Passo a passo</div>
            <h2 style={{
              fontFamily: 'var(--font-anton), sans-serif',
              fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
              lineHeight: .92, textTransform: 'uppercase',
              marginBottom: '4rem',
            }}>Como participar</h2>

            <div className="steps-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2rem', position: 'relative',
            }}>
              {/* connecting gradient line */}
              <div className="steps-line" style={{
                position: 'absolute',
                top: '2.25rem', left: '12.5%', right: '12.5%',
                height: 1,
                background: 'linear-gradient(90deg, rgba(66,44,118,.6), rgba(1,225,142,.5))',
                opacity: .4,
              }} />

              {STEPS.map((s, i) => (
                <div key={i}
                  onMouseEnter={() => setHovStep(i)}
                  onMouseLeave={() => setHovStep(null)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                >
                  <div style={{
                    width: '4.5rem', height: '4.5rem', borderRadius: '50%',
                    border: `1px solid ${hovStep === i ? '#01E18E' : 'rgba(1,225,142,.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-anton), sans-serif',
                    fontSize: '1.4rem', lineHeight: 1,
                    color:      hovStep === i ? '#0f0d17' : '#01E18E',
                    background: hovStep === i ? '#01E18E' : '#0D0A20',
                    position: 'relative', zIndex: 1,
                    boxShadow: hovStep === i ? '0 0 28px rgba(1,225,142,.5)' : 'none',
                    transition: 'all .3s', marginBottom: '1.5rem',
                  }}>{s.n}</div>
                  <h3 style={{
                    fontFamily: 'var(--font-barlow), sans-serif',
                    fontSize: '1.1rem', fontWeight: 700,
                    letterSpacing: '.08em', textTransform: 'uppercase',
                    color: '#fff', marginBottom: '.5rem',
                  }}>{s.title}</h3>
                  <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.38)', lineHeight: 1.6 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{
          padding: '8rem 2rem', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(66,44,118,.22) 0%, transparent 70%)',
        }}>
          {/* decorative corner lines */}
          <div style={{
            position: 'absolute', top: '3rem', left: '3rem',
            width: 60, height: 60,
            borderLeft: '1px solid rgba(1,225,142,.2)',
            borderTop: '1px solid rgba(1,225,142,.2)',
          }} />
          <div style={{
            position: 'absolute', bottom: '3rem', right: '3rem',
            width: 60, height: 60,
            borderRight: '1px solid rgba(1,225,142,.2)',
            borderBottom: '1px solid rgba(1,225,142,.2)',
          }} />

          <div style={{
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: 'clamp(3rem, 9vw, 6.5rem)',
            lineHeight: .9, textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}>
            Pronto para<br />
            <span style={{ color: '#01E18E' }}>entrar no jogo?</span>
          </div>
          <p style={{
            fontSize: '1.05rem', color: 'rgba(255,255,255,.38)',
            marginBottom: '2.75rem',
          }}>
            48 colegas já estão no bolão. Faltam apenas alguns dias para o início.
          </p>
          <Link href="/login" className="shimmer-btn" style={{
            fontFamily: 'var(--font-barlow), sans-serif',
            fontWeight: 800, fontSize: '1.05rem',
            letterSpacing: '.15em', textTransform: 'uppercase',
            color: '#0f0d17', background: '#01E18E',
            textDecoration: 'none', padding: '1rem 3rem',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 0 45px rgba(1,225,142,.42)',
          }}>
            ⚽ Quero Participar
          </Link>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '0 2rem' }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem', padding: '2rem 0',
          }}>
            <div style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontWeight: 700, fontSize: '.85rem',
              letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,.28)',
            }}>
              ⚽ <span style={{ color: '#01E18E' }}>Bolão da Copa 2026</span> · Vendemmia
            </div>
            <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.14)' }}>
              © 2026 · Acesso exclusivo · Vendemmia Logística Integrada
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
