import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface SalonSlugLayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

async function getSalonBySlugServer(slug: string) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
            },
        }
    );

    const { data, error } = await supabase
        .from('salon_details')
        .select('id, name, description, image, city_name, district_name')
        .eq('slug', slug)
        .eq('status', 'APPROVED')
        .single();

    if (error) return null;
    return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    try {
        const salon = await getSalonBySlugServer(slug);

        if (salon) {
            const title = `${salon.name} - Güzellik Randevu`;
            const description = salon.description
                ? salon.description.substring(0, 160)
                : `${salon.name} - Online randevu alın, hizmetleri inceleyin ve yorumları okuyun.`;

            return {
                title,
                description,
                keywords: [salon.name, salon.city_name || '', salon.district_name || '', 'güzellik', 'randevu', 'kuaför'].filter(Boolean),
                openGraph: {
                    title,
                    description,
                    images: salon.image ? [{ url: salon.image }] : [],
                    type: 'website',
                },
            };
        }
    } catch (error) {
        console.error('Salon metadata oluşturulurken hata:', error);
    }

    return {
        title: 'Salon - Güzellik Randevu',
        description: 'Güzellik ve bakım salonları için online randevu sistemi.',
    };
}

export default async function SalonSlugLayout({ children }: SalonSlugLayoutProps) {
    return <>{children}</>;
}
