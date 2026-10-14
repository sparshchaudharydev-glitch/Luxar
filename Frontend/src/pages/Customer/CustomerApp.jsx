import { useEffect, useRef, useState } from 'react';
import styles from './CustomerApp.module.css';
import { api } from '../../api/client.js';

// Customer view: scan a restaurant's QR code, or type the code if the camera isn't available.
export default function CustomerApp({ name, onLogout }) {
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <span className={styles.logo}>LUXAR</span>
        <div className={styles.right}>
          <span className={styles.hello}>{name ? `Hi, ${name}` : 'Welcome'}</span>
          <button type="button" className={styles.logout} onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <ScanQr />
      </main>
    </div>
  );
}

function ScanQr() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Always release the camera when leaving this screen.
  useEffect(() => stopCamera, []);

  function stopCamera() {
    clearTimeout(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }

  async function startCamera() {
    setError(null);
    setResult(null);

    // BarcodeDetector is available in Chrome and Edge. Other browsers use the manual field.
    if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera scanning isn’t supported in this browser. Type the code below instead.');
      return;
    }

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = streamRef.current;
      await videoRef.current.play();
      setScanning(true);
      detectLoop(new window.BarcodeDetector({ formats: ['qr_code'] }));
    } catch {
      stopCamera();
      setError('Couldn’t open the camera. Check that camera access is allowed for this site.');
    }
  }

  function detectLoop(detector) {
    const tick = async () => {
      if (!streamRef.current) return;
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes.length) {
          stopCamera();
          handleCode(codes[0].rawValue);
          return;
        }
      } catch {
        // Ignore single-frame failures and keep scanning.
      }
      timerRef.current = setTimeout(tick, 250);
    };
    tick();
  }

  async function handleCode(code) {
    const value = code.trim();
    if (!value) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await api.scanQr(value));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    handleCode(manualCode);
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Scan a restaurant’s QR code</h2>
      <p className={styles.text}>Point your camera at the code on the table or at the entrance.</p>

      <div className={styles.viewport}>
        <video ref={videoRef} className={styles.video} muted playsInline hidden={!scanning} />
        {!scanning && <div className={styles.placeholder}>Camera is off</div>}
      </div>

      {scanning ? (
        <button type="button" className={styles.secondary} onClick={stopCamera}>
          Stop camera
        </button>
      ) : (
        <button type="button" className={styles.primary} onClick={startCamera} disabled={busy}>
          Start scanning
        </button>
      )}

      <form className={styles.manual} onSubmit={handleManualSubmit}>
        <label className={styles.field}>
          <span>Or type the code</span>
          <input value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="e.g. SPICE-HOUSE-01" />
        </label>
        <button type="submit" className={styles.secondary} disabled={busy || !manualCode.trim()}>
          {busy ? 'Looking up…' : 'Look up'}
        </button>
      </form>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className={styles.result}>
          <h3 className={styles.resultTitle}>{result.name ?? 'Scan result'}</h3>
          {result.location && <p className={styles.text}>{result.location}</p>}
          <pre className={styles.raw}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
