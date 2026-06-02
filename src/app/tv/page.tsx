import { getTvData } from '@/lib/tv-data'
import { TvSlideshow } from '@/components/tv/tv-slideshow'

export const revalidate = 60

export default async function TvPage() {
  const data = await getTvData()
  return <TvSlideshow data={data} />
}
