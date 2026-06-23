import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SlotService } from '../slot'

// slot.ts modülünü import ettiğinde @/lib/supabase'i de import eder.
// Bu dosya browser'a özgü createBrowserClient kullandığı için Node.js ortamında crash eder.
// vi.mock ile o modülü sahte bir nesneyle değiştiriyoruz — sadece test sırasında.
vi.mock('@/lib/supabase', () => ({ supabase: {} }))

// --- Test Yardımcıları ---

// Chainable Supabase mock'u: .select().eq().neq()... şeklindeki zincirleri destekler.
// Her tablo için farklı bir yanıt döndürebilir.
// "then" metodu sayesinde `await supabase.from(...).select().eq()` şeklinde
// direkt await yapılabiliyor (Promise zincirine dahil oluyor).
type TableMock = { data: unknown; error: unknown }

function createMockSupabase(tables: Record<string, TableMock>) {
    function makeChain(tableName: string) {
        const result = tables[tableName] ?? { data: null, error: null }
        const chain: Record<string, unknown> = {}
        for (const method of ['select', 'eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'in', 'limit', 'or']) {
            chain[method] = () => chain
        }
        chain.maybeSingle = () => Promise.resolve(result)
        chain.single = () => Promise.resolve(result)
        chain.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
            Promise.resolve(result).then(resolve, reject)
        chain.catch = (reject: (e: unknown) => unknown) => Promise.resolve(result).catch(reject)
        return chain
    }
    return { from: (table: string) => makeChain(table) }
}

// Test tarihimiz: 10 Haziran 2024, Pazartesi
const TEST_DATE = new Date(2024, 5, 10)
const STAFF_ID = 'staff-abc'
const STAFF_NAME = 'Ayşe'

// Verilen tarihin saat:dakika'sını yerel saatle döndürür
function hhmm(date: Date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// Test tarihinde belirli saat:dakika'ya sahip Date nesnesi oluşturur
function makeTime(h: number, m: number) {
    const d = new Date(TEST_DATE)
    d.setHours(h, m, 0, 0)
    return d
}

// ─────────────────────────────────────────────────────────────────────────────
// BÖLÜM 1: generateTimeSlots — saf fonksiyon, veritabanı yok
// Bu fonksiyon sadece giriş parametrelerine bakarak slotları hesaplar.
// Test etmesi en kolay bölüm çünkü mock gerektirmiyor.
// ─────────────────────────────────────────────────────────────────────────────
describe('generateTimeSlots', () => {

    it('09:00-17:00 arası 60 dakikalık hizmet için 15 slot üretir', () => {
        // Mantık: 09:00'dan başlayıp her 30 dakikada bir slot açılır.
        // Son geçerli başlangıç 16:00 (16:00 + 60dk = 17:00 ≤ 17:00).
        // 16:30 + 60dk = 17:30 > 17:00 → artık sığmaz.
        const slots = SlotService.generateTimeSlots(TEST_DATE, '09:00', '17:00', 60, STAFF_ID, STAFF_NAME)
        expect(slots).toHaveLength(15)
        expect(hhmm(slots[0].startTime)).toBe('09:00')
        expect(hhmm(slots[14].startTime)).toBe('16:00')
    })

    it('30 dakikalık hizmet için 16 slot üretir', () => {
        // Son geçerli başlangıç: 16:30 (16:30 + 30dk = 17:00 ≤ 17:00)
        const slots = SlotService.generateTimeSlots(TEST_DATE, '09:00', '17:00', 30, STAFF_ID, STAFF_NAME)
        expect(slots).toHaveLength(16)
        expect(hhmm(slots[15].startTime)).toBe('16:30')
    })

    it('90 dakikalık hizmet için 14 slot üretir', () => {
        // Son geçerli başlangıç: 15:30 (15:30 + 90dk = 17:00 ≤ 17:00)
        const slots = SlotService.generateTimeSlots(TEST_DATE, '09:00', '17:00', 90, STAFF_ID, STAFF_NAME)
        expect(slots).toHaveLength(14)
        expect(hhmm(slots[13].startTime)).toBe('15:30')
    })

    it('hizmet süresi pencereye tam sığıyorsa 1 slot döner', () => {
        // 09:00 + 60dk = 10:00 = bitiş → sığar.
        // 09:30 + 60dk = 10:30 > 10:00 → sığmaz.
        const slots = SlotService.generateTimeSlots(TEST_DATE, '09:00', '10:00', 60, STAFF_ID, STAFF_NAME)
        expect(slots).toHaveLength(1)
        expect(hhmm(slots[0].startTime)).toBe('09:00')
        expect(hhmm(slots[0].endTime)).toBe('10:00')
    })

    it('hizmet süresi pencereden büyükse boş dizi döner', () => {
        // 09:00 + 120dk = 11:00 > 10:00 → hiç sığmaz
        const slots = SlotService.generateTimeSlots(TEST_DATE, '09:00', '10:00', 120, STAFF_ID, STAFF_NAME)
        expect(slots).toHaveLength(0)
    })

    it('her slot tam olarak 30 dakika aralıklıdır', () => {
        const slots = SlotService.generateTimeSlots(TEST_DATE, '09:00', '12:00', 30, STAFF_ID, STAFF_NAME)
        for (let i = 1; i < slots.length; i++) {
            const diff = slots[i].startTime.getTime() - slots[i - 1].startTime.getTime()
            expect(diff).toBe(30 * 60 * 1000) // 30 dakika = 1.800.000 ms
        }
    })

    it('her slotun endTime = startTime + serviceDuration', () => {
        const slots = SlotService.generateTimeSlots(TEST_DATE, '09:00', '17:00', 75, STAFF_ID, STAFF_NAME)
        for (const slot of slots) {
            const diff = slot.endTime.getTime() - slot.startTime.getTime()
            expect(diff).toBe(75 * 60 * 1000)
        }
    })

    it('tüm slotlar available: true olarak işaretlenir', () => {
        const slots = SlotService.generateTimeSlots(TEST_DATE, '09:00', '12:00', 60, STAFF_ID, STAFF_NAME)
        expect(slots.every(s => s.available)).toBe(true)
    })

    it('staffId ve staffName slotlara aktarılır', () => {
        const slots = SlotService.generateTimeSlots(TEST_DATE, '09:00', '10:00', 60, 'my-staff-id', 'Fatma')
        expect(slots[0].staffId).toBe('my-staff-id')
        expect(slots[0].staffName).toBe('Fatma')
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// BÖLÜM 2: getStaffAvailableSlots — çakışma (conflict) tespiti
// Bu bölümde Supabase mock'u kullanıyoruz.
// İş mantığı: mevcut randevularla çakışan slotlar filtrelenir.
// ─────────────────────────────────────────────────────────────────────────────
describe('getStaffAvailableSlots — çakışma tespiti', () => {

    it('randevu yokken tüm slotlar açık döner', async () => {
        const db = createMockSupabase({
            working_hours: { data: { start_time: '09:00', end_time: '17:00', is_day_off: false }, error: null },
            appointments: { data: [], error: null },
        })

        const slots = await SlotService.getStaffAvailableSlots(
            STAFF_ID, STAFF_NAME, TEST_DATE, 60, undefined, db as never
        )
        // 09:00-17:00, 60dk, 30dk aralık → 15 slot
        expect(slots).toHaveLength(15)
    })

    it('personel izinliyse (is_day_off) boş dizi döner', async () => {
        const db = createMockSupabase({
            // is_day_off: true → salon saatlerine bakar ama salonId verilmediğinde null döner
            working_hours: { data: { start_time: '09:00', end_time: '17:00', is_day_off: true }, error: null },
            appointments: { data: [], error: null },
        })

        const slots = await SlotService.getStaffAvailableSlots(
            STAFF_ID, STAFF_NAME, TEST_DATE, 60, undefined, db as never
        )
        expect(slots).toHaveLength(0)
    })

    it('10:00-11:00 randevusu varken o penceredeki slotlar kapatılır', async () => {
        // Açıklama: 60dk hizmet, 30dk aralıklar.
        // Bloke olması beklenen başlangıçlar: 09:30, 10:00, 10:30
        //   - 09:30: endTime(10:30) randevunun içine giriyor → çakışır
        //   - 10:00: startTime randevunun içinde → çakışır
        //   - 10:30: startTime randevunun içinde → çakışır
        // Açık kalması beklenen: 09:00 ve 11:00 sonrası
        const apptStart = makeTime(10, 0).toISOString()
        const apptEnd = makeTime(11, 0).toISOString()

        const db = createMockSupabase({
            working_hours: { data: { start_time: '09:00', end_time: '17:00', is_day_off: false }, error: null },
            appointments: {
                data: [{ start_time: apptStart, end_time: apptEnd, status: 'CONFIRMED' }],
                error: null,
            },
        })

        const slots = await SlotService.getStaffAvailableSlots(
            STAFF_ID, STAFF_NAME, TEST_DATE, 60, undefined, db as never
        )

        const startTimes = slots.map(s => hhmm(s.startTime))
        expect(startTimes).not.toContain('09:30')
        expect(startTimes).not.toContain('10:00')
        expect(startTimes).not.toContain('10:30')
        expect(startTimes).toContain('09:00')
        expect(startTimes).toContain('11:00')
        // Toplam: 15 - 3 = 12 slot
        expect(slots).toHaveLength(12)
    })

    it('slotu kapsayan (spanning) randevu da çakışma olarak tespit edilir', async () => {
        // 90dk randevu (10:00-11:30), hizmet 120dk.
        // 09:00-11:00 slotu: startTime(9:00) ≤ booked.start(10:00) VE endTime(11:00) ≥ booked.end(11:30)?
        //   11:00 ≥ 11:30 → HAYIR → çakışmaz.
        // Ama şunu test edelim: 09:30-11:30 slotu (120dk):
        //   startTime(9:30) ≤ booked.start(10:00) VE endTime(11:30) ≥ booked.end(11:30) → ÇAKIŞIR
        const apptStart = makeTime(10, 0).toISOString()
        const apptEnd = makeTime(11, 30).toISOString()

        const db = createMockSupabase({
            working_hours: { data: { start_time: '09:00', end_time: '17:00', is_day_off: false }, error: null },
            appointments: {
                data: [{ start_time: apptStart, end_time: apptEnd, status: 'CONFIRMED' }],
                error: null,
            },
        })

        // 120dk hizmet, 30dk aralık
        const slots = await SlotService.getStaffAvailableSlots(
            STAFF_ID, STAFF_NAME, TEST_DATE, 120, undefined, db as never
        )

        const startTimes = slots.map(s => hhmm(s.startTime))
        // 09:30 başlangıçlı slot randevuyu kapsıyor → bloke
        expect(startTimes).not.toContain('09:30')
        // 11:30 sonrası güvenli
        expect(startTimes).toContain('11:30')
    })

    it('iptal edilmiş randevular çakışma sayılmaz', async () => {
        // DB zaten "neq('status', 'CANCELLED')" filtresiyle sorgu yapıyor.
        // Mock bize CANCELLED randevuyu döndürmez (zaten filtrelenmiş gibi davranır).
        // Test: CANCELLED randevu gönderiyoruz → sanki DB filtrelemiş gibi — tüm slotlar açık.
        const apptStart = makeTime(10, 0).toISOString()
        const apptEnd = makeTime(11, 0).toISOString()

        const db = createMockSupabase({
            working_hours: { data: { start_time: '09:00', end_time: '17:00', is_day_off: false }, error: null },
            // Mock DB'nin filtresi uygulandıktan sonraki sonucu simüle eder: boş dizi
            appointments: { data: [], error: null },
        })

        const slots = await SlotService.getStaffAvailableSlots(
            STAFF_ID, STAFF_NAME, TEST_DATE, 60, undefined, db as never
        )
        expect(slots).toHaveLength(15) // hiçbir slot bloke değil
    })

    it('çalışma saati kaydı yoksa boş dizi döner', async () => {
        const db = createMockSupabase({
            working_hours: { data: null, error: null },
            // salonId verilmediğinden salon_working_hours sorgulanmaz
        })

        const slots = await SlotService.getStaffAvailableSlots(
            STAFF_ID, STAFF_NAME, TEST_DATE, 60, undefined, db as never
        )
        expect(slots).toHaveLength(0)
    })

    it('personel saati yoksa salon saatlerine (fallback) döner', async () => {
        // is_day_off: true → salon_working_hours'a bak
        const db = createMockSupabase({
            working_hours: { data: { start_time: '09:00', end_time: '17:00', is_day_off: true }, error: null },
            salon_working_hours: { data: { start_time: '10:00', end_time: '18:00', is_closed: false }, error: null },
            appointments: { data: [], error: null },
        })

        const slots = await SlotService.getStaffAvailableSlots(
            STAFF_ID, STAFF_NAME, TEST_DATE, 60, 'salon-xyz', db as never
        )
        // 10:00-18:00, 60dk → 15 slot, ilk 10:00
        expect(slots.length).toBeGreaterThan(0)
        expect(hhmm(slots[0].startTime)).toBe('10:00')
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// BÖLÜM 3: getAvailableSlots — tam akış (hizmet süresi + personel listesi)
// ─────────────────────────────────────────────────────────────────────────────
describe('getAvailableSlots — tam akış', () => {

    it('durationMin verilince DB hizmet süresi sorgusu atlanir', async () => {
        const db = createMockSupabase({
            staff: { data: [{ id: STAFF_ID, name: STAFF_NAME }], error: null },
            working_hours: { data: { start_time: '09:00', end_time: '17:00', is_day_off: false }, error: null },
            appointments: { data: [], error: null },
        })

        const slots = await SlotService.getAvailableSlots(
            { salonId: 'salon-1', durationMin: 60, date: TEST_DATE },
            db as never
        )
        expect(slots.length).toBeGreaterThan(0)
        // Slotlar zamana göre sıralı
        for (let i = 1; i < slots.length; i++) {
            expect(slots[i].startTime.getTime()).toBeGreaterThanOrEqual(slots[i - 1].startTime.getTime())
        }
    })

    it('serviceId verilince o hizmetin duration_min değeri kullanılır', async () => {
        const db = createMockSupabase({
            salon_services: { data: { duration_min: 45 }, error: null },
            staff_services: { data: [{ staff_id: STAFF_ID }], error: null },
            staff: { data: [{ id: STAFF_ID, name: STAFF_NAME }], error: null },
            working_hours: { data: { start_time: '09:00', end_time: '17:00', is_day_off: false }, error: null },
            appointments: { data: [], error: null },
        })

        const slots = await SlotService.getAvailableSlots(
            { salonId: 'salon-1', serviceId: 'svc-1', date: TEST_DATE },
            db as never
        )
        // 45dk hizmet, her slot endTime - startTime = 45dk olmalı
        expect(slots.length).toBeGreaterThan(0)
        const diff = slots[0].endTime.getTime() - slots[0].startTime.getTime()
        expect(diff).toBe(45 * 60 * 1000)
    })

    it('serviceIds dizisi verilince süreler toplanır', async () => {
        // İki hizmet: 30dk + 45dk = toplam 75dk
        const db = createMockSupabase({
            salon_services: {
                data: [{ duration_min: 30 }, { duration_min: 45 }],
                error: null,
            },
            staff_services: { data: [{ staff_id: STAFF_ID }], error: null },
            staff: { data: [{ id: STAFF_ID, name: STAFF_NAME }], error: null },
            working_hours: { data: { start_time: '09:00', end_time: '17:00', is_day_off: false }, error: null },
            appointments: { data: [], error: null },
        })

        const slots = await SlotService.getAvailableSlots(
            { salonId: 'salon-1', serviceIds: ['svc-1', 'svc-2'], date: TEST_DATE },
            db as never
        )
        expect(slots.length).toBeGreaterThan(0)
        const diff = slots[0].endTime.getTime() - slots[0].startTime.getTime()
        expect(diff).toBe(75 * 60 * 1000)
    })

    it('seçilen hizmeti veremeyen personel slotu dönmez', async () => {
        // staff_services boş döner — yani bu salonda kimse bu hizmeti veremiyor
        const db = createMockSupabase({
            salon_services: { data: { duration_min: 30 }, error: null },
            staff_services: { data: [], error: null },
            staff: { data: [{ id: STAFF_ID, name: STAFF_NAME }], error: null },
            working_hours: { data: { start_time: '09:00', end_time: '17:00', is_day_off: false }, error: null },
            appointments: { data: [], error: null },
        })

        const slots = await SlotService.getAvailableSlots(
            { salonId: 'salon-1', serviceId: 'svc-1', date: TEST_DATE },
            db as never
        )
        expect(slots).toHaveLength(0)
    })

    it('personel bulunamazsa boş dizi döner', async () => {
        const db = createMockSupabase({
            staff: { data: [], error: null },
        })

        const slots = await SlotService.getAvailableSlots(
            { salonId: 'salon-1', durationMin: 60, date: TEST_DATE },
            db as never
        )
        expect(slots).toHaveLength(0)
    })

    it('servis süresi belirlenemezse hata fırlatır', async () => {
        const db = createMockSupabase({
            salon_services: { data: null, error: null },
            staff: { data: [{ id: STAFF_ID, name: STAFF_NAME }], error: null },
        })

        await expect(
            SlotService.getAvailableSlots(
                { salonId: 'salon-1', serviceId: 'svc-ghost', date: TEST_DATE },
                db as never
            )
        ).rejects.toThrow('Service duration could not be determined')
    })
})
