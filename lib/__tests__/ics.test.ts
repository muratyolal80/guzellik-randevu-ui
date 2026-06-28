import { describe, it, expect, beforeAll } from 'vitest';
import { buildIcs, type IcsEvent } from '@/lib/calendar/ics';

describe('buildIcs', () => {
  const baseEvent: IcsEvent = {
    uid: 'apt-12345',
    start: new Date('2026-07-15T10:00:00Z'),
    end: new Date('2026-07-15T11:00:00Z'),
    summary: 'Saç Kesimi',
  };

  it('returns a valid VCALENDAR/VEVENT envelope', () => {
    const ics = buildIcs(baseEvent);
    expect(ics).toMatch(/^BEGIN:VCALENDAR/);
    expect(ics).toMatch(/END:VCALENDAR$/);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('METHOD:PUBLISH');
  });

  it('encodes UID with kuaforara.com.tr domain', () => {
    expect(buildIcs(baseEvent)).toContain('UID:apt-12345@kuaforara.com.tr');
  });

  it('formats dates as ICS UTC format YYYYMMDDTHHMMSSZ', () => {
    const ics = buildIcs(baseEvent);
    expect(ics).toContain('DTSTART:20260715T100000Z');
    expect(ics).toContain('DTEND:20260715T110000Z');
  });

  it('includes DTSTAMP with current timestamp', () => {
    const ics = buildIcs(baseEvent);
    expect(ics).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
  });

  it('uses \\r\\n line endings (RFC 5545)', () => {
    const ics = buildIcs(baseEvent);
    expect(ics.includes('\r\n')).toBe(true);
    // No bare \n
    expect(/[^\r]\n/.test(ics)).toBe(false);
  });

  it('uses CONFIRMED status', () => {
    expect(buildIcs(baseEvent)).toContain('STATUS:CONFIRMED');
  });

  describe('text escaping (RFC 5545 §3.3.11)', () => {
    it('escapes commas in summary', () => {
      const ics = buildIcs({ ...baseEvent, summary: 'Saç, Sakal' });
      expect(ics).toContain('SUMMARY:Saç\\, Sakal');
    });

    it('escapes semicolons in summary', () => {
      const ics = buildIcs({ ...baseEvent, summary: 'Test; içerik' });
      expect(ics).toContain('SUMMARY:Test\\; içerik');
    });

    it('escapes backslashes in summary', () => {
      const ics = buildIcs({ ...baseEvent, summary: 'C:\\path' });
      expect(ics).toContain('SUMMARY:C:\\\\path');
    });

    it('escapes newlines in description', () => {
      const ics = buildIcs({
        ...baseEvent,
        description: 'Line 1\nLine 2',
      });
      expect(ics).toContain('DESCRIPTION:Line 1\\nLine 2');
    });
  });

  describe('optional fields', () => {
    it('omits DESCRIPTION when not provided', () => {
      const ics = buildIcs(baseEvent);
      expect(ics).not.toContain('DESCRIPTION:');
    });

    it('includes DESCRIPTION when provided', () => {
      const ics = buildIcs({ ...baseEvent, description: 'Randevu detayı' });
      expect(ics).toContain('DESCRIPTION:Randevu detayı');
    });

    it('omits LOCATION when not provided', () => {
      const ics = buildIcs(baseEvent);
      expect(ics).not.toContain('LOCATION:');
    });

    it('includes LOCATION when provided', () => {
      const ics = buildIcs({ ...baseEvent, location: 'Atatürk Cad. No:5' });
      expect(ics).toContain('LOCATION:Atatürk Cad. No:5');
    });

    it('omits ORGANIZER when not provided', () => {
      const ics = buildIcs(baseEvent);
      expect(ics).not.toContain('ORGANIZER:');
    });

    it('includes ORGANIZER with CN format when provided', () => {
      const ics = buildIcs({ ...baseEvent, organizer: 'Salon ABC' });
      expect(ics).toContain('ORGANIZER:CN=Salon ABC');
    });
  });

  describe('all fields combined', () => {
    it('produces a complete event', () => {
      const ics = buildIcs({
        ...baseEvent,
        description: 'Saç kesimi randevusu',
        location: 'Atatürk Cad. No:5, Ankara',
        organizer: 'Stil Kuaför',
      });
      expect(ics).toContain('SUMMARY:Saç Kesimi');
      expect(ics).toContain('DESCRIPTION:Saç kesimi randevusu');
      expect(ics).toContain('LOCATION:Atatürk Cad. No:5\\, Ankara');
      expect(ics).toContain('ORGANIZER:CN=Stil Kuaför');
    });
  });
});
