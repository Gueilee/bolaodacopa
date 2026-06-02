import { getSession }        from '@/lib/session'
import { redirect }           from 'next/navigation'
import { getSocialPosts }     from '@/app/actions/social'
import { MuralCreatePost }    from '@/components/mural-create-post'
import { MuralPostCard }      from '@/components/mural-post-card'

export const revalidate = 0

export default async function MuralPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const posts = await getSocialPosts()

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1a1625' }}>
          💬 Central da Torcida
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8a8490' }}>
          Fotos, comentários, curtidas · Sua voz na tela de todos
        </p>
      </div>

      {/* Create post */}
      <MuralCreatePost userName={session.name} />

      {/* Posts feed */}
      {posts.length === 0 ? (
        <div className="card p-12 text-center">
          <p style={{ fontSize: 48 }}>🏆</p>
          <p className="font-semibold mt-3" style={{ color: '#1a1625' }}>
            A Central da Torcida está vazia!
          </p>
          <p className="text-sm mt-1" style={{ color: '#8a8490' }}>
            Seja o primeiro a compartilhar um momento da Copa.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
