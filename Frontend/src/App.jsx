import { useCallback, useEffect, useState } from 'react';
import IntroSplash from './components/IntroSplash/IntroSplash.jsx';
import EntryGate from './pages/Entry/EntryGate.jsx';
import AdminApp from './AdminApp.jsx';
import CustomerApp from './pages/Customer/CustomerApp.jsx';
import { api } from './api/client.js';
import { useRoute } from './router.js';
import PublicRestaurant from './pages/Public/PublicRestaurant.jsx';
import { loadSession, saveSession } from './session.js';

// Top-level flow: intro splash -> entry gate (Customer or Owner) -> admin or customer view.
// Owner accounts come from /auth, so any signed-in owner is an admin.
// Customers have no account; their choice is kept in sessionStorage.
export default function App() {
  const route = useRoute();
  const [showIntro, setShowIntro] = useState(true);
  const finishIntro = useCallback(() => setShowIntro(false), []);

  const [session, setSession] = useState(() => loadSession());
  // Admin sessions are checked against the server cookie on load, so a stale one is dropped.
  const [checking, setChecking] = useState(() => loadSession()?.role === 'admin');

  const startSession = useCallback((next) => {
    saveSession(next);
    setSession(next);
  }, []);

  useEffect(() => {
    if (!checking) return;
    api
      .me()
      .then((user) => startSession({ role: 'admin', name: user.name, email: user.email }))
      .catch(() => startSession(null))
      .finally(() => setChecking(false));
  }, [checking, startSession]);

  const logout = useCallback(async () => {
    if (session?.role === 'admin') {
      try {
        await api.logout();
      } catch {
        // Even if the server is unreachable, clear this browser's session.
      }
    }
    startSession(null);
  }, [session, startSession]);

  // QR scans open this page directly, so it skips the intro and the sign-in gate.
  if (route.page === 'public-restaurant') return <PublicRestaurant id={route.id} />;

  let view = null;
  if (!checking) {
    if (!session) {
      view = (
        <EntryGate
          onCustomer={() => startSession({ role: 'customer' })}
          onOwnerLogin={(user) => startSession({ role: 'admin', name: user.name, email: user.email })}
        />
      );
    } else if (session.role === 'admin') {
      view = <AdminApp user={session} onLogout={logout} />;
    } else {
      view = <CustomerApp onLogout={logout} />;
    }
  }

  return (
    <>
      {showIntro && <IntroSplash onDone={finishIntro} />}
      {view}
    </>
  );
}
