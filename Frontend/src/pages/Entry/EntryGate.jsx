import { useState } from 'react';
import styles from './EntryGate.module.css';
import { api } from '../../api/client.js';
import GoogleButton, { GOOGLE_ENABLED } from './GoogleButton.jsx';

// First screen after the intro: pick Customer or Owner, then log in or sign up as an Owner.
export default function EntryGate({ onCustomer, onOwnerLogin }) {
  const [step, setStep] = useState('choose');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  function switchStep(next) {
    setError(null);
    setStep(next);
  }

  async function finish(action) {
    setError(null);
    setBusy(true);
    try {
      onOwnerLogin(await action());
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    finish(() => api.login(email.trim(), password));
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError('The passwords don’t match.');
      return;
    }
    // Create the account, then sign straight in with the same details.
    finish(async () => {
      await api.register({ name: name.trim(), email: email.trim(), password });
      return api.login(email.trim(), password);
    });
  }

  const googleButton = GOOGLE_ENABLED && (
    <>
      <div className={styles.googleSlot}>
        <GoogleButton
          text={step === 'signup' ? 'signup_with' : 'continue_with'}
          onCredential={(credential) => finish(() => api.googleLogin(credential))}
          onError={setError}
        />
      </div>
      <div className={styles.divider}>or</div>
    </>
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>LUXAR</div>

        {step === 'choose' && (
          <>
            <h1 className={styles.title}>Welcome</h1>
            <p className={styles.subtitle}>How are you using Luxar today?</p>
            <div className={styles.choices}>
              <button type="button" className={styles.choice} onClick={onCustomer}>
                <span className={styles.choiceTitle}>I’m a customer</span>
                <span className={styles.choiceText}>Scan a restaurant’s QR code</span>
              </button>
              <button type="button" className={styles.choice} onClick={() => switchStep('login')}>
                <span className={styles.choiceTitle}>I’m an owner</span>
                <span className={styles.choiceText}>Manage your restaurants</span>
              </button>
            </div>
          </>
        )}

        {step === 'login' && (
          <form onSubmit={handleLogin} className={styles.form}>
            <h1 className={styles.title}>Owner login</h1>
            {googleButton}
            <label className={styles.field}>
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required autoFocus />
            </label>
            <label className={styles.field}>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.secondary} onClick={() => switchStep('choose')} disabled={busy}>
                Back
              </button>
              <button type="submit" className={styles.primary} disabled={busy}>
                {busy ? 'Signing in…' : 'Log in'}
              </button>
            </div>
            <button type="button" className={styles.linkButton} onClick={() => switchStep('signup')} disabled={busy}>
              New owner? Create an account
            </button>
          </form>
        )}

        {step === 'signup' && (
          <form onSubmit={handleSignup} className={styles.form}>
            <h1 className={styles.title}>Create owner account</h1>
            {googleButton}
            <label className={styles.field}>
              <span>Full name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required autoFocus />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </label>
            <label className={styles.field}>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Confirm password</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <p className={styles.hint}>At least 8 characters.</p>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.secondary} onClick={() => switchStep('login')} disabled={busy}>
                Back
              </button>
              <button type="submit" className={styles.primary} disabled={busy}>
                {busy ? 'Creating account…' : 'Sign up'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
