import { useEffect, useState } from 'react';

// Hash-based routing: no extra dependency needed.
//   #/restaurants                      -> list of restaurants
//   #/restaurant-settings              -> settings for the first restaurant
//   #/restaurant-settings/:id          -> settings for one restaurant
//   #/restaurant-settings/:id/:tab     -> one restaurant, one section
//   #/restaurant-settings/account      -> account settings
//   #/restaurants/:id/:tab             -> older links, shown in restaurant settings
//   #/qr-codes                         -> QR codes for each restaurant
//   #/r/:id                            -> public restaurant page (opened by a QR scan)

export function parseHash(hash) {
  const [first, second, third] = hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((part) => decodeURIComponent(part));

  if (first === 'restaurant-settings') {
    if (second === 'account') return { page: 'restaurant-settings', id: null, tab: 'account' };
    return { page: 'restaurant-settings', id: second ?? null, tab: third || 'overview' };
  }

  if (first === 'restaurants' && second) {
    return { page: 'restaurant-settings', id: second, tab: third || 'overview' };
  }

  // Public page opened by a QR code scan: #/r/:id (no sign-in needed).
  if (first === 'r' && second) return { page: 'public-restaurant', id: second };

  if (first === 'qr-codes') return { page: 'qr-codes' };

  return { page: 'restaurants' };
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function go(hash) {
  window.location.hash = hash;
}
