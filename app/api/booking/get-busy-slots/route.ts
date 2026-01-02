/**
 * API Route: Get Busy Slots
 * Personelin dolu saatlerini getirir
 *
 * GET /api/booking/get-busy-slots?staff_id=xxx&date=2025-12-26
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const staffId = searchParams.get('staff_id');
    const date = searchParams.get('date'); // YYYY-MM-DD format

    // Validasyon
    if (!staffId || !date) {
      return NextResponse.json(
        { error: 'staff_id ve date parametreleri gerekli' },
        { status: 400 }
      );
    }

    // Tarih formatını kontrol et
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'date formatı YYYY-MM-DD olmalı' },
        { status: 400 }
      );
    }

    // O günün başlangıç ve bitiş saatlerini hesapla
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    // Dolu randevuları çek
    // Use supabaseAdmin to bypass RLS policies for reading busy slots
    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select('start_time, end_time')
      .eq('staff_id', staffId)
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .in('status', ['PENDING', 'CONFIRMED']) // İptal edilmemiş randevular
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Randevular getirilirken hata oluştu' },
        { status: 500 }
      );
    }

    // Zaman aralıklarını sadeleştir (HH:MM formatında)
    const busySlots = (appointments || []).map(apt => ({
      start: new Date(apt.start_time).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      end: new Date(apt.end_time).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
    }));

    return NextResponse.json({
      success: true,
      busySlots
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
