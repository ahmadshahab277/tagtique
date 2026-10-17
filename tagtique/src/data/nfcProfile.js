const STORAGE_KEY = 'tagtique_nfc_profiles';

export const NFC_FIELDS = [
  { id: 'instagram', label: 'Instagram', placeholder: 'username or profile URL', kind: 'social' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/…', kind: 'url' },
  { id: 'whatsapp', label: 'WhatsApp', placeholder: '03xx or https://wa.me/…', kind: 'whatsapp' },
  { id: 'phone', label: 'Phone', placeholder: '03xx xxxxxxx', kind: 'phone' },
  { id: 'email', label: 'Email', placeholder: 'name@email.com', kind: 'email' },
  { id: 'website', label: 'Website', placeholder: 'https://…', kind: 'url' },
  { id: 'tiktok', label: 'TikTok', placeholder: 'username or profile URL', kind: 'social' },
  { id: 'youtube', label: 'YouTube', placeholder: 'channel URL or @name', kind: 'social' },
  { id: 'facebook', label: 'Facebook', placeholder: 'profile URL or name', kind: 'social' }
];

function emptyFields() {
  return Object.fromEntries(NFC_FIELDS.map((field) => [field.id, { enabled: false, value: '' }]));
}

export function createNfcProfile(designId) {
  const id = `nfc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id,
    designId,
    name: '',
    bio: '',
    fields: emptyFields()
  };
}

function readAll() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveNfcProfile(profile) {
  const all = readAll();
  all[profile.id] = profile;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return profile;
}

export function loadNfcProfile(id) {
  if (!id) return null;
  return readAll()[id] || null;
}

export function fieldError(field, value) {
  const text = String(value || '').trim();
  if (!text) return 'Enter a value, or turn this off.';
  if (field.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return 'Enter a valid email.';
  if (field.kind === 'phone' && text.replace(/\D/g, '').length < 10) return 'Enter a valid phone number.';
  if (field.kind === 'url' && !/^https?:\/\/.+\..+/.test(text)) return 'Enter a full URL starting with https://';
  if (field.kind === 'whatsapp') {
    const digits = text.replace(/\D/g, '');
    const isLink = /^https?:\/\/(wa\.me|api\.whatsapp\.com)\//.test(text);
    if (!isLink && digits.length < 10) return 'Enter a phone number or a WhatsApp link.';
  }
  return '';
}

export function publicFieldHref(field, value) {
  const text = String(value || '').trim();
  if (field.kind === 'email') return `mailto:${text}`;
  if (field.kind === 'phone') return `tel:${text.replace(/\s/g, '')}`;
  if (field.kind === 'whatsapp') {
    if (/^https?:\/\//.test(text)) return text;
    return `https://wa.me/${text.replace(/\D/g, '')}`;
  }
  if (field.kind === 'url') return text;
  if (/^https?:\/\//.test(text)) return text;
  const handle = text.replace(/^@/, '');
  if (field.id === 'instagram') return `https://instagram.com/${handle}`;
  if (field.id === 'tiktok') return `https://www.tiktok.com/@${handle}`;
  if (field.id === 'youtube') return `https://www.youtube.com/@${handle}`;
  if (field.id === 'facebook') return `https://facebook.com/${handle}`;
  return text;
}

export function visibleProfileFields(profile) {
  if (!profile?.fields) return [];
  return NFC_FIELDS.flatMap((field) => {
    const entry = profile.fields[field.id];
    if (!entry?.enabled) return [];
    if (fieldError(field, entry.value)) return [];
    return [{ ...field, value: entry.value.trim(), href: publicFieldHref(field, entry.value) }];
  });
}
