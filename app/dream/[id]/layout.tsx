import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

type Props = {
    params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    // Fetch dream data for meta tags
    const { data: dream } = await supabase
        .from('dreams')
        .select('text, style, mood, created_at, panels (image_url)')
        .eq('id', params.id)
        .eq('is_public', true)
        .single()

    if (!dream) {
        return {
            title: 'Dream Not Found - Dream Organizer',
            description: 'Turn your dreams into beautiful comic panels with AI',
        }
    }

    const title = dream.text.split('\n')[0].substring(0, 60) + '...'
    const description = `A ${dream.mood || 'mysterious'} dream visualized in ${dream.style || 'Arcane'} style. Created on Dream Organizer.`
    const imageUrl = (dream as any).panels?.[0]?.image_url || 'https://dream-organizer.vercel.app/og-image.png'

    return {
        title: `${title} - Dream Organizer`,
        description,
        openGraph: {
            title,
            description,
            images: [imageUrl],
            type: 'website',
            url: `https://dream-organizer.vercel.app/dream/${params.id}`,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    }
}

export default function DreamLayout({ children }: { children: React.ReactNode }) {
    return children
}
