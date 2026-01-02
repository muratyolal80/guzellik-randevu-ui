'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import type { BookingDisplay } from '@/types';

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/bookings');
    } else if (user) {
      fetchBookings();
    }
  }, [user, authLoading, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // We need to join multiple tables to get all info
      // appointments -> salons (name)
      // appointments -> staff (name)
      // appointments -> salon_services -> global_services (name)
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          status,
          salon:salons (
            name,
            address
          ),
          staff:staff (
            name
          ),
          salon_service:salon_services (
            price,
            duration_min,
            global_service:global_services (
              name
            )
          )
        `)
        .eq('customer_id', user?.id)
        .order('start_time', { ascending: false });

      if (error) throw error;

      // Transform data to match our interface
      const formattedBookings = (data || []).map((item: any) => ({
        id: item.id,
        start_time: item.start_time,
        end_time: item.end_time,
        status: item.status,
        salon: {
          name: item.salon?.name || 'Bilinmeyen Salon',
          address: item.salon?.address || '',
        },
        staff: {
          name: item.staff?.name || 'Herhangi Bir Personel',
        },
        service: {
          name: item.salon_service?.global_service?.name || 'Hizmet',
          price: item.salon_service?.price || 0,
          duration_min: item.salon_service?.duration_min || 0,
        }
      }));

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Onaylandı</span>;
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Bekliyor</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">İptal Edildi</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">Tamamlandı</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="flex-1 bg-gray-50 py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-text-main">Randevularım</h1>
            <Link href="/" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors">
              Yeni Randevu Al
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-border p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-gray-400">calendar_today</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">Henüz randevunuz yok</h3>
              <p className="text-text-secondary mb-6">Güzellik ve bakım ihtiyaçlarınız için hemen randevu oluşturun.</p>
              <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors">
                Salonları Keşfet
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-text-main">{booking.salon.name}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-sm text-text-secondary mt-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">content_cut</span>
                          <span className="font-medium text-text-main">{booking.service.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                          <span>{booking.staff.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">event</span>
                          <span>{formatDate(booking.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                          <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 mt-2 md:mt-0">
                      <div className="text-right">
                        <span className="block text-xs text-text-muted">Toplam Tutar</span>
                        <span className="text-xl font-bold text-primary">{booking.service.price} TL</span>
                      </div>
                      {/* Future feature: Cancel/Reschedule buttons */}
                      {/* 
                      <button className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                        İptal Et
                      </button> 
                      */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}