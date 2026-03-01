import { Metadata, ResolvingMetadata } from 'next';
import { SalonDataService } from '@/services/db';

interface Props {
    params: Promise<{ id: string }>;
    children: React.ReactNode;
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;

    try {
        const salon = await SalonDataService.getSalonById(id);

        if (!salon) {
            return {
                title: 'Güzellik Randevu - Salon Bulunamadı',
                description: 'Aradığınız güzellik salonu bulunamadı.'
            };
        }

        const title = `${salon.name} - ${salon.district_name}, ${salon.city_name} | Güzellik Randevu`;
        const description = salon.description || `${salon.name} salonu için online randevu al. ${salon.district_name} bölgesindeki en iyi güzellik hizmetleri.`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: salon.image ? [salon.image] : [],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: salon.image ? [salon.image] : [],
            },
            keywords: [
                salon.name,
                salon.district_name,
                salon.city_name,
                'güzellik salonu',
                'randevu',
                'kuaför',
                'bakım',
                ...(salon.tags || [])
            ]
        };
    } catch (error) {
        return {
            title: 'Güzellik Randevu',
            description: 'Güzellik salonu randevu sistemi'
        };
    }
}

export default function SalonLayout({ children }: Props) {
    return <>{children}</>;
}
