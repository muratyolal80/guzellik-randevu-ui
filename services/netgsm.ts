import { IYSService } from './db';

// Netgsm API Configuration
const API_BASE = "https://api.netgsm.com.tr/sms/rest/v2";

// Helper to get config from LocalStorage (set via Admin Panel)
const getConfig = () => {
    // Next.js can import this module on the server during build/SSR.
    // Guard browser-only APIs.
    if (typeof window === 'undefined') {
        return {
            usercode: '',
            password: '',
            header: ''
        };
    }

    return {
        usercode: window.localStorage.getItem('netgsm_usercode') || '',
        password: window.localStorage.getItem('netgsm_password') || '',
        header: window.localStorage.getItem('netgsm_header') || ''
    };
};

const getAuthHeader = () => {
    const { usercode, password } = getConfig();
    if (!usercode || !password) return null;

    // btoa is also browser-only in many runtimes
    if (typeof window === 'undefined' || typeof window.btoa !== 'function') return null;

    return 'Basic ' + window.btoa(`${usercode}:${password}`);
};

// Check if we have valid credentials to attempt a real call
const hasCredentials = () => {
    const { usercode, password, header } = getConfig();
    return usercode.length > 0 && password.length > 0 && header.length > 0;
};

export const NetgsmService = {
  
  /**
   * 1. OTP SMS Gönderimi
   */
  sendOtp: async (phone: string, code: string): Promise<boolean> => {
    const { header } = getConfig();
    const authHeader = getAuthHeader();
    const isConfigured = hasCredentials();

    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('90')) cleanPhone = cleanPhone.substring(2);
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);

    const msg = `Dogrulama Kodunuz: ${code}`; 

    // DEMO MODE CHECK
    if (!isConfigured) {
        console.warn("Netgsm ayarları eksik. Demo modunda çalışıyor.");
        await new Promise(r => setTimeout(r, 1200)); // Simulate network latency
        
        // Log as DEMO
        await IYSService.logSMS({
            phone: cleanPhone,
            message_type: 'OTP',
            content: `[DEMO] ${msg}`,
            status: 'DEMO'
        });
        
        return true; // Always return success in Demo mode
    }

    // REAL API CALL
    try {
      const response = await fetch(`${API_BASE}/otp`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            msgheader: header,
            msg: msg,
            no: cleanPhone
        })
      });

      if (!response.ok) {
        throw new Error("API Hatası: " + response.status);
      }

      // Log success
      await IYSService.logSMS({
          phone: cleanPhone,
          message_type: 'OTP',
          content: msg,
          status: 'SENT'
      });
      return true;

    } catch (error) {
      console.error("Netgsm Real API Error:", error);
      
      // Log failure
      await IYSService.logSMS({
          phone: cleanPhone,
          message_type: 'OTP',
          content: msg,
          status: 'FAILED'
      });
      return false; 
    }
  },

  /**
   * 2. Randevu Bilgilendirme SMS
   */
  sendAppointmentInfo: async (phone: string, details: string): Promise<boolean> => {
    return sendGenericSms(phone, details, "0", 'INFO');
  },

  /**
   * 3. Kampanya SMS (Ticari)
   */
  sendCampaign: async (phone: string, message: string): Promise<boolean> => {
    return sendGenericSms(phone, message, "11", 'CAMPAIGN');
  }
};

// Genel SMS Gönderim Yardımcısı
async function sendGenericSms(phone: string, message: string, iysFilter: "0" | "11", type: 'INFO' | 'CAMPAIGN'): Promise<boolean> {
    const { header } = getConfig();
    const authHeader = getAuthHeader();
    const isConfigured = hasCredentials();

    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('90')) cleanPhone = cleanPhone.substring(2);
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);

    // DEMO MODE
    if (!isConfigured) {
        await new Promise(r => setTimeout(r, 1000));
        await IYSService.logSMS({
            phone: cleanPhone,
            message_type: type,
            content: `[DEMO] ${message}`,
            status: 'DEMO'
        });
        return true;
    }

    try {
        const payload = {
            msgheader: header,
            messages: [{ msg: message, no: cleanPhone }],
            encoding: "TR",
            iysfilter: iysFilter,
            partnercode: "" 
        };

        const response = await fetch(`${API_BASE}/send`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader!,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("API Hatası");
        
        await IYSService.logSMS({
            phone: cleanPhone,
            message_type: type,
            content: message,
            status: 'SENT'
        });
        return true;

    } catch (error) {
        console.error("Netgsm SMS Gönderilemedi:", error);
        await IYSService.logSMS({
            phone: cleanPhone,
            message_type: type,
            content: message,
            status: 'FAILED'
        });
        return false;
    }
}
