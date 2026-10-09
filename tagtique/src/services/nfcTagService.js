import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { nfcPageUrl } from '../utils/nfcPayload.js';

function adminPassword() {
  return String(import.meta.env.VITE_ADMIN_PASSWORD || 'tagtique-admin');
}

function explain(error) {
  const message = error?.message || error?.details || 'The NFC request failed.';
  if (/NFC admin password is not set/i.test(message)) {
    return 'Supabase does not have the NFC admin password yet. Run supabase/NFC_SETUP.md once in the SQL editor.';
  }
  if (/Not allowed/i.test(message)) {
    return 'Supabase rejected the admin password. The database secret must match VITE_ADMIN_PASSWORD.';
  }
  if (/schema cache|could not find the function|does not exist|404/i.test(message)) {
    return 'The NFC tables are not in Supabase yet. Run the migration in supabase/migrations, then the setup steps.';
  }
  return message;
}

async function callAdmin(fn, args) {
  if (!supabase || !isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }
  const { data, error } = await supabase.rpc(fn, { p_password: adminPassword(), ...args });
  if (error) throw new Error(explain(error));
  return data;
}

export const nfcTagService = {
  async list() {
    const data = await callAdmin('admin_list_nfc_tags', {});
    return Array.isArray(data) ? data : [];
  },

  async save(payload) {
    return callAdmin('admin_save_nfc_tag', { p_payload: payload });
  },

  async bulkRegister(codes) {
    return callAdmin('admin_bulk_register_nfc_tags', { p_codes: codes });
  },

  async verify(tagCode, reading) {
    return callAdmin('admin_verify_nfc_tag', {
      p_tag_code: tagCode,
      p_read: {
        ...reading,
        expectedUrl: nfcPageUrl(tagCode)
      }
    });
  },

  async audit(tagCode) {
    const data = await callAdmin('admin_list_nfc_audit', { p_tag_code: tagCode });
    return Array.isArray(data) ? data : [];
  },

  async getPublic(tagCode, { timeoutMs = 8000 } = {}) {
    if (!supabase || !isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }
    const request = supabase.rpc('get_public_nfc_tag', { p_tag_code: tagCode });
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('The contact lookup took too long.')), timeoutMs);
    });
    const { data, error } = await Promise.race([request, timeout]);
    if (error) throw new Error(explain(error));
    return data;
  }
};
