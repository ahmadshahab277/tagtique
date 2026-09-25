const SESSION_KEY = 'tagtique_admin_session';

function configuredPassword() {
  const password = import.meta.env.VITE_ADMIN_PASSWORD;
  if (!password || !String(password).trim()) return '';
  return String(password);
}

export function isAdminConfigured() {
  return Boolean(configuredPassword());
}

export function isAdminSessionActive() {
  try {
    if (!configuredPassword()) return false;
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function startAdminSession(password) {
  const expected = configuredPassword();
  if (!expected || String(password) !== expected) return false;
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    return false;
  }
  return true;
}

export function endAdminSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures; the route check will fail closed.
  }
}
