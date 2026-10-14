import { useEffect, useRef } from 'react';

// Set VITE_GOOGLE_CLIENT_ID in Frontend/.env to turn Google sign-in on.
const CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
export const GOOGLE_ENABLED = Boolean(CLIENT_ID);

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
let scriptPromise = null;

// Loads Google Identity Services once, however many buttons are shown.
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not load Google sign-in. Check your connection.'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

// Google's official button. Hands the signed ID token to onCredential.
export default function GoogleButton({ text = 'continue_with', onCredential, onError }) {
  const slotRef = useRef(null);
  const handlers = useRef({ onCredential, onError });

  useEffect(() => {
    handlers.current = { onCredential, onError };
  });

  useEffect(() => {
    if (!GOOGLE_ENABLED) return undefined;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !slotRef.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => {
            if (response.credential) handlers.current.onCredential(response.credential);
            else handlers.current.onError?.('Google sign-in was cancelled.');
          },
        });
        window.google.accounts.id.renderButton(slotRef.current, {
          theme: 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          width: 320,
        });
      })
      .catch((err) => handlers.current.onError?.(err.message));

    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!GOOGLE_ENABLED) return null;
  return <div ref={slotRef} />;
}
