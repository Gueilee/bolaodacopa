import { getSession }        from '@/lib/session'
import { redirect }           from 'next/navigation'
import { getSocialPosts }     from '@/app/actions/social'
import { MuralCreatePost }    from '@/components/mural-create-post'
import { MuralPostCard }      from '@/components/mural-post-card'
import { db }                 from '@/lib/db'
import { users }              from '@/db/schema'
import { eq }                 from 'drizzle-orm'

export const revalidate = 0

export default async function MuralPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [posts, me] = await Promise.all([
    getSocialPosts(),
    db.query.users.findFirst({ where: eq(users.id, session.userId), columns: { avatarUrl: true } }),
  ])

  const totalLikes    = posts.reduce((a, p) => a + p.likesCount, 0)
  const totalComments = posts.reduce((a, p) => a + p.commentsCount, 0)

  return (
    <div className="max-w-2xl mx-auto animate-fade-in" style={{ paddingBottom: 40 }}>

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d0920 0%, #1a0d36 60%, #0f1a0d 100%)',
        borderRadius: 24, padding: '28px 32px',
        marginBottom: 24, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 180, height: 180,
          background: 'radial-gradient(circle, rgba(1,225,142,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 60, width: 140, height: 140,
          background: 'radial-gradient(circle, rgba(66,44,118,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>💬</span>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#faf9f5', letterSpacing: '-0.02em' }}>
              Central da Torcida
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 340 }}>
            Compartilhe momentos, torça junto, celebre — <span style={{ color: '#01E18E' }}>sua voz na copa!</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
            {[
              { icon: '📝', label: `${posts.length} posts` },
              { icon: '❤️', label: `${totalLikes} curtidas` },
              { icon: '💬', label: `${totalComments} comentários` },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Criar post */}
      <div style={{ marginBottom: 20 }}>
        <MuralCreatePost userName={session.name} userAvatar={me?.avatarUrl ?? null} />
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 20, padding: '48px 32px', textAlign: 'center',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🏆</div>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#1a1625', margin: '0 0 6px' }}>
            A Central da Torcida está esperando por você!
          </p>
          <p style={{ fontSize: 14, color: '#8a8490', margin: 0 }}>
            Seja o primeiro a compartilhar um momento da Copa.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map((post) => (
            <MuralPostCard
              key={post.id}
              post={post}
              currentUserId={session.userId}
              isAdmin={session.role === 'admin'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
