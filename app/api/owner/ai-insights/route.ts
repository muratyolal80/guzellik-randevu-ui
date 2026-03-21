import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { salonId, viewType } = await req.json();

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // 2. Fetch Data for Analysis (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let query = supabase
            .from('appointments')
            .select(`
                id,
                start_time,
                status,
                salon_id,
                staff_id,
                staff:staff(name),
                salon_services(price, global_services(name))
            `)
            .gte('start_time', thirtyDaysAgo.toISOString());

        if (viewType === 'all') {
            // Get all salons owned by this user
            const { data: salons } = await supabase.from('salons').select('id').eq('owner_id', user.id);
            if (salons) {
                query = query.in('salon_id', salons.map(s => s.id));
            }
        } else {
            query = query.eq('salon_id', salonId);
        }

        const { data: appointments, error } = await query;
        if (error) throw error;

        // 3. Summarize Data for Prompt
        const summary = {
            totalAppointments: appointments?.length || 0,
            completed: appointments?.filter(a => a.status === 'COMPLETED').length || 0,
            cancelled: appointments?.filter(a => a.status === 'CANCELLED').length || 0,
            revenue: appointments?.filter(a => a.status === 'COMPLETED').reduce((acc, a) => {
                const price = (a.salon_services as any)?.[0]?.price || 0;
                return acc + price;
            }, 0),
            topServices: {} as Record<string, number>,
            busyDays: {} as Record<string, number>,
            staffPerformance: {} as Record<string, number>
        };

        appointments?.forEach(a => {
            const serviceName = (a.salon_services as any)?.[0]?.global_services?.name || 'Unknown';
            summary.topServices[serviceName] = (summary.topServices[serviceName] || 0) + 1;

            const day = new Date(a.start_time).toLocaleDateString('tr-TR', { weekday: 'long' });
            summary.busyDays[day] = (summary.busyDays[day] || 0) + 1;

            const sName = (a.staff as any)?.name || 'Unknown';
            summary.staffPerformance[sName] = (summary.staffPerformance[sName] || 0) + 1;
        });

        // 4. Call Gemini 1.5 Flash (or Mock if no key)
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        
        if (!apiKey) {
            // Fallback: Analytical Mock Response (Always better than error)
            return NextResponse.json({
                analysis: `[DEMO MODU] İşletmenizin son 30 gündeki performansı incelenmiştir.
                Toplam ${summary.totalAppointments} randevu içerisinden %${((summary.completed/summary.totalAppointments)*100).toFixed(0)} başarı oranı yakalanmıştır.
                En popüler hizmetiniz: ${Object.entries(summary.topServices).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Veri yok'}.
                Gelecek ay için %15 büyüme öngörülmektedir.`,
                predictions: "Önümüzdeki hafta özellikle Salı ve Çarşamba günleri doluluk oranınızın %85'e ulaşması beklenmektedir.",
                tips: [
                    "Kampanya saatlerini sabah saatlerine kaydırarak doluluğu dengeleyebilirsiniz.",
                    "En çok tercih edilen servisiniz için sadakat programı başlatın.",
                    "İptal oranlarını düşürmek için 2 saat öncesi yerine 4 saat öncesi hatırlatıcı gönderin."
                ]
            });
        }

        const prompt = `Sen profesyonel bir güzellik salonu iş analistisin. Aşağıdaki verileri analiz et ve Türkçe olarak yanit ver.
        Veriler (Son 30 Gün):
        - Toplam Randevu: ${summary.totalAppointments}
        - Tamamlanan: ${summary.completed}
        - İptal Edilen: ${summary.cancelled}
        - Tahmini Ciro: ${summary.revenue} TL
        - Popüler Hizmetler: ${JSON.stringify(summary.topServices)}
        - Yoğun Günler: ${JSON.stringify(summary.busyDays)}
        - Personel Performansı: ${JSON.stringify(summary.staffPerformance)}

        Yanıtın şu JSON formatında olsun:
        {
          "analysis": "Genel performans analizi...",
          "predictions": "Gelecek ay / hafta tahminleri...",
          "tips": ["Tavsiye 1", "Tavsiye 2", "Tavsiye 3"]
        }
        Sadece JSON döndür.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        const result = await response.json();
        const aiResponse = JSON.parse(result.candidates[0].content.parts[0].text);

        return NextResponse.json(aiResponse);

    } catch (err) {
        console.error('AI Insights Error:', err);
        return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
    }
}
