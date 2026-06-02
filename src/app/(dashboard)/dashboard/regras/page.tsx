export const metadata = { title: 'Regras do Bolão | Copa 2026' }

type ExampleRow = {
  palpite:   string
  resultado: string
  situacao:  string
  pontos:    number
  badge:     string
}

const matchExamples: ExampleRow[] = [
  { palpite: '2 × 1', resultado: '2 × 1', situacao: 'Placar exato',                        pontos: 10, badge: '⚡' },
  { palpite: '1 × 1', resultado: '1 × 1', situacao: 'Placar exato (empate)',                pontos: 10, badge: '⚡' },
  { palpite: '2 × 0', resultado: '3 × 1', situacao: 'Vencedor + saldo corretos (+2)',       pontos: 7,  badge: '🎯' },
  { palpite: '2 × 1', resultado: '1 × 0', situacao: 'Vencedor correto (errou saldo)',       pontos: 5,  badge: '✓'  },
  { palpite: '1 × 1', resultado: '2 × 2', situacao: 'Acertou o empate (errou o placar)',   pontos: 5,  badge: '✓'  },
  { palpite: '0 × 0', resultado: '1 × 1', situacao: 'Acertou o empate (errou o placar)',   pontos: 5,  badge: '✓'  },
  { palpite: '2 × 1', resultado: '0 × 1', situacao: 'Resultado errado (errou o vencedor)', pontos: 0,  badge: '✗'  },
  { palpite: '1 × 0', resultado: '1 × 1', situacao: 'Resultado errado (previu vitória, deu empate)', pontos: 0, badge: '✗' },
]

const badgeStyle = (pts: number) => {
  if (pts === 10) return { bg: 'rgba(1,168,102,0.12)',  color: '#01a866', border: 'rgba(1,168,102,0.3)'  }
  if (pts === 7)  return { bg: 'rgba(212,160,23,0.12)', color: '#d4a017', border: 'rgba(212,160,23,0.3)' }
  if (pts === 5)  return { bg: 'rgba(37,99,235,0.10)',  color: '#2563eb', border: 'rgba(37,99,235,0.25)' }
  return              { bg: 'rgba(0,0,0,0.04)',      color: '#aaa8b0', border: '#e8e4df'              }
}

export default function RegrasPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1a1625' }}>📋 Regras do Bolão</h1>
        <p className="text-sm mt-1" style={{ color: '#8a8490' }}>
          Entenda como os pontos são calculados a cada jogo da Copa 2026
        </p>
      </div>

      {/* ── Pontuação por Partida ── */}
      <section className="card overflow-hidden">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede8' }}>
          <h2 className="text-base font-bold" style={{ color: '#1a1625' }}>⚽ Pontuação por Partida</h2>
          <p className="text-sm mt-1" style={{ color: '#8a8490' }}>
            Cada partida vale de 0 a 10 pontos dependendo do acerto. A pontuação é igual em todas as fases.
          </p>
        </div>

        {/* Cards de pontuação */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0 }}>

          {[
            {
              badge: '⚡', pts: 10, color: '#01a866', bg: 'rgba(1,168,102,0.06)', border: 'rgba(1,168,102,0.15)',
              title: 'Placar Exato',
              desc: 'Acertou os dois placares exatos, incluindo empate com placar certo.',
              ex: 'Palpitou 2×1 → Resultado 2×1',
            },
            {
              badge: '🎯', pts: 7, color: '#d4a017', bg: 'rgba(212,160,23,0.06)', border: 'rgba(212,160,23,0.15)',
              title: 'Vencedor + Saldo',
              desc: 'Acertou quem vence e a diferença de gols, mas errou o placar exato. Não se aplica a empates.',
              ex: 'Palpitou 2×0 → Resultado 3×1 (saldo +2)',
            },
            {
              badge: '✓', pts: 5, color: '#2563eb', bg: 'rgba(37,99,235,0.05)', border: 'rgba(37,99,235,0.15)',
              title: 'Vencedor Correto / Empate',
              desc: 'Acertou quem vence mas errou o saldo. Ou acertou que haveria empate mas errou o placar.',
              ex: 'Palpitou 2×1 → Resultado 1×0\nPalpitou 1×1 → Resultado 2×2',
            },
            {
              badge: '✗', pts: 0, color: '#c4bfba', bg: 'rgba(0,0,0,0.02)', border: '#e8e4df',
              title: 'Resultado Errado',
              desc: 'Errou quem vence. Ex: previu vitória da casa mas ganhou o visitante, ou previu empate mas teve vencedor.',
              ex: 'Palpitou 2×1 → Resultado 0×1',
            },
          ].map((item) => (
            <div
              key={item.pts}
              style={{ background: item.bg, borderRight: '1px solid #f0ede8', borderBottom: '1px solid #f0ede8', padding: '20px 20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{item.badge}</span>
                <span style={{ fontSize: 28, fontWeight: 900, color: item.color, fontVariantNumeric: 'tabular-nums' }}>
                  {item.pts}
                  <span style={{ fontSize: 13, fontWeight: 500, color: item.color, opacity: 0.7, marginLeft: 2 }}>pts</span>
                </span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1625', margin: '0 0 6px' }}>{item.title}</p>
              <p style={{ fontSize: 12, color: '#6b6672', lineHeight: 1.5, margin: '0 0 10px' }}>{item.desc}</p>
              <p style={{ fontSize: 11, color: '#aaa8b0', fontStyle: 'italic', margin: 0, whiteSpace: 'pre-line' }}>
                Ex: {item.ex}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tabela de exemplos ── */}
      <section className="card overflow-hidden">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede8' }}>
          <h2 className="text-base font-bold" style={{ color: '#1a1625' }}>📊 Exemplos Práticos</h2>
          <p className="text-sm mt-1" style={{ color: '#8a8490' }}>Veja como cada situação é pontuada</p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e8e4df', background: '#faf9f7' }}>
                {['Seu Palpite', 'Resultado Real', 'Situação', 'Pontos'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matchExamples.map((row, i) => {
                const s = badgeStyle(row.pontos)
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f5f2ef' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#422c76', fontVariantNumeric: 'tabular-nums' }}>
                      {row.palpite}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1a1625', fontVariantNumeric: 'tabular-nums' }}>
                      {row.resultado}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a4555' }}>
                      {row.situacao}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 10,
                        background: s.bg, color: s.color,
                        border: `1px solid ${s.border}`,
                        fontSize: 12, fontWeight: 800,
                      }}>
                        {row.badge} {row.pontos} pts
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Bônus de Torneio ── */}
      <section className="card overflow-hidden">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede8' }}>
          <h2 className="text-base font-bold" style={{ color: '#1a1625' }}>🌟 Bônus Final de Torneio</h2>
          <p className="text-sm mt-1" style={{ color: '#8a8490' }}>
            Pontos extras concedidos ao final da Copa, baseados no palpite final que você registrou.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 0 }}>
          {[
            { icon: '🏆', label: 'Campeão',        pts: 50, desc: 'Acertou o time campeão do mundo' },
            { icon: '⚽', label: 'Artilheiro',      pts: 50, desc: 'Acertou o jogador com mais gols' },
            { icon: '🥈', label: 'Vice-Campeão',    pts: 25, desc: 'Acertou o segundo colocado' },
          ].map(b => (
            <div key={b.label} style={{ padding: '20px', borderRight: '1px solid #f0ede8', textAlign: 'center' }}>
              <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>{b.icon}</span>
              <p style={{ fontSize: 28, fontWeight: 900, color: '#422c76', margin: '0 0 4px', fontVariantNumeric: 'tabular-nums' }}>
                +{b.pts}
                <span style={{ fontSize: 12, fontWeight: 500, color: '#9a86c4', marginLeft: 2 }}>pts</span>
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1625', margin: '0 0 4px' }}>{b.label}</p>
              <p style={{ fontSize: 11, color: '#8a8490', margin: 0, lineHeight: 1.4 }}>{b.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 24px', background: '#faf9f7', borderTop: '1px solid #f0ede8' }}>
          <p style={{ fontSize: 12, color: '#8a8490', margin: 0 }}>
            💡 O palpite final pode ser alterado até você clicar em <strong style={{ color: '#1a1625' }}>"Finalizar Palpites"</strong>.
            Após isso, fica registrado e não pode ser mudado.
          </p>
        </div>
      </section>

      {/* ── Resumo das regras gerais ── */}
      <section className="card p-6 space-y-4">
        <h2 className="text-base font-bold" style={{ color: '#1a1625' }}>📌 Regras Gerais</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '🔒', text: 'Ao clicar em "Finalizar Palpites", seus palpites ficam bloqueados e não podem ser alterados.' },
            { icon: '⏰', text: 'Partidas encerradas não aceitam palpites — registre seus palpites antes de cada jogo começar.' },
            { icon: '📊', text: 'A pontuação é igual em todas as fases — grupo, oitavas, quartas, semi, final.' },
            { icon: '🎯', text: 'A regra de "Vencedor + Saldo" (7 pts) não se aplica a empates, pois o saldo é sempre 0.' },
            { icon: '🏅', text: 'No caso de empate, o resultado de 90 minutos é o que conta para o bolão (não prorrogação ou pênaltis).' },
            { icon: '🏆', text: 'O ranking é atualizado automaticamente após cada partida ser pontuada pelo administrador.' },
          ].map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <p style={{ fontSize: 13, color: '#4a4555', lineHeight: 1.6, margin: 0 }}>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

    </div>
  )
}
