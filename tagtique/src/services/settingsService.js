import { supabase } from './supabaseClient.js';

const SUPPORT_PHONE_KEY = 'tagtique_support_phone';
const STORE_SETTINGS_KEY = 'tagtique_store_settings';
const QR_MODE_KEY = 'tagtique_qr_mode';

export const DEFAULT_SUPPORT_PHONE = '03292082080';

const DEFAULT_SETTINGS = {
  supportPhone: DEFAULT_SUPPORT_PHONE,
  workshopLocation: '208 Chak Road, West Canal Road, Faisalabad, Pakistan',
  raastId: 'tagtique@mcb',
  meezanIban: 'PK36MEZN0001234567890123',
  qrMode: 'url' // 'url' (Direct Web Link - Opens Online Web Profile) | 'vcard' (Contact Card)
};

export const settingsService = {
  getSupportPhone() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(SUPPORT_PHONE_KEY);
        if (stored && stored.trim()) return stored.trim();
      }
    } catch (_) {}
    return DEFAULT_SUPPORT_PHONE;
  },

  setSupportPhone(phone) {
    const clean = String(phone || '').trim() || DEFAULT_SUPPORT_PHONE;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(SUPPORT_PHONE_KEY, clean);
        window.dispatchEvent(new CustomEvent('tagtique_settings_updated', { detail: { supportPhone: clean } }));
      }
    } catch (_) {}
    return clean;
  },

  getQrMode() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(QR_MODE_KEY);
        if (stored === 'vcard') {
          // Reset legacy vcard so camera opens the webpage
          localStorage.setItem(QR_MODE_KEY, 'url');
          return 'url';
        }
        if (stored) return stored;
      }
    } catch (_) {}
    return 'url'; // Default to Direct Web Link so phone cameras open the vehicle profile page
  },

  setQrMode(mode) {
    const valid = mode === 'url' ? 'url' : 'vcard';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(QR_MODE_KEY, valid);
        window.dispatchEvent(new CustomEvent('tagtique_settings_updated', { detail: { qrMode: valid } }));
      }
    } catch (_) {}
    return valid;
  },

  getStoreSettings() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORE_SETTINGS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            supportPhone: this.getSupportPhone(),
            qrMode: this.getQrMode()
          };
        }
      }
    } catch (_) {}
    return {
      ...DEFAULT_SETTINGS,
      supportPhone: this.getSupportPhone(),
      qrMode: this.getQrMode()
    };
  },

  saveStoreSettings(settings) {
    const updated = {
      ...DEFAULT_SETTINGS,
      ...settings,
      supportPhone: settings?.supportPhone?.trim() || this.getSupportPhone()
    };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(updated));
        if (updated.supportPhone) {
          this.setSupportPhone(updated.supportPhone);
        }
        if (updated.qrMode) {
          this.setQrMode(updated.qrMode);
        }
        window.dispatchEvent(new CustomEvent('tagtique_settings_updated', { detail: updated }));
      }
    } catch (_) {}
    return updated;
  }
};
