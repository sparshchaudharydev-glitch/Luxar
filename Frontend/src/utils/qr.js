import QRCode from 'qrcode';

// The QR codes point at this address. Set VITE_PUBLIC_BASE_URL (for example http://192.168.1.20:5173)
// when a phone on the same Wi-Fi needs to open the page; otherwise the current site address is used.
const BASE = import.meta.env?.VITE_PUBLIC_BASE_URL || window.location.origin;

export function restaurantPublicUrl(id) {
  return `${BASE}/#/r/${encodeURIComponent(id)}`;
}

// PNG data URL for an image tag or download link.
export function qrImage(text) {
  return QRCode.toDataURL(text, { width: 280, margin: 2, errorCorrectionLevel: 'M' });
}
