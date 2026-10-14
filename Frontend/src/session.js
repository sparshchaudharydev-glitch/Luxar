// Keeps the signed-in user between page reloads for this browser tab.
// Storage can be blocked (private mode, site data cleared), so every access is wrapped.
const KEY = 'luxar.session';

export function loadSession() {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    if (session) {
      window.sessionStorage.setItem(KEY, JSON.stringify(session));
    } else {
      window.sessionStorage.removeItem(KEY);
    }
  } catch {
    // Ignore: the app still works, the session just won't survive a reload.
  }
}
