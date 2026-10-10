// Restaurant records now come from the API (see src/api/client.js).
// The helpers below adapt those records for the UI. Pages that aren't backed
// by the API yet (employees, menu, combos, FAQ, settings) still use the sample data here.

export const currentUser = {
  name: 'Martin Franci',
  initials: 'MF',
};

export const currentLocation = {
  name: 'Louvre Opéra',
  address: '2464 Royal Ln, Mesa',
};

export const settingsDefaults = {
  name: 'Louvre Opéra',
  email: 'hello@louvreopera.com',
  phone: '+91 98765 43210',
  cuisine: 'Continental',
  currency: 'INR (₹)',
  opening: '10:00',
  closing: '23:00',
  onlineOrdering: true,
  notifications: true,
};

export const employees = [
  { id: 1, name: 'Aarav Sharma', role: 'Manager', restaurant: 'The Spice House', status: 'Active', joined: 'Mar 12, 2024' },
  { id: 2, name: 'Priya Nair', role: 'Chef', restaurant: 'Incognito Kitchen & Bar', status: 'Active', joined: 'Jun 02, 2024' },
  { id: 3, name: 'Rohan Mehta', role: 'Waiter', restaurant: 'Hoppá Bistro', status: 'On leave', joined: 'Sep 18, 2024' },
  { id: 4, name: 'Sara Khan', role: 'Cashier', restaurant: 'Trattoria Venezia', status: 'Active', joined: 'Jan 21, 2025' },
  { id: 5, name: 'Dev Patel', role: 'Chef', restaurant: 'Hedonist Restaurant', status: 'Inactive', joined: 'Nov 05, 2023' },
  { id: 6, name: 'Ananya Rao', role: 'Host', restaurant: 'Rudas Bistro', status: 'Active', joined: 'Jul 30, 2025' },
];

export const menuItems = [
  { id: 1, name: 'Paneer Tikka', category: 'Starters', price: 320, type: 'veg', available: true },
  { id: 2, name: 'Chicken Seekh Kebab', category: 'Starters', price: 380, type: 'non-veg', available: true },
  { id: 3, name: 'Dal Makhani', category: 'Mains', price: 260, type: 'veg', available: true },
  { id: 4, name: 'Butter Chicken', category: 'Mains', price: 420, type: 'non-veg', available: true },
  { id: 5, name: 'Veg Biryani', category: 'Mains', price: 300, type: 'veg', available: false },
  { id: 6, name: 'Gulab Jamun', category: 'Desserts', price: 150, type: 'veg', available: true },
  { id: 7, name: 'Mango Lassi', category: 'Drinks', price: 140, type: 'veg', available: true },
  { id: 8, name: 'Oreo Shake', category: 'Drinks', price: 220, type: 'veg', available: true },
];

export const combos = [
  { id: 1, name: 'Family Feast', items: ['2 × Butter Chicken', '4 × Butter Naan', '1 × Dal Makhani', '2 × Mango Lassi'], price: 1199, active: true },
  { id: 2, name: 'Lunch Express', items: ['1 × Veg Biryani', '1 × Raita', '1 × Gulab Jamun'], price: 349, active: true },
  { id: 3, name: 'Date Night', items: ['Paneer Tikka', 'Butter Chicken', '2 × Mocktails'], price: 899, active: false },
];

export const faqs = [
  { q: 'How do I add a new restaurant?', a: 'Go to My Restaurants and click “Add Restaurants”. Enter the name and location, then save.' },
  { q: 'How do I change my restaurant’s opening hours?', a: 'Open Restaurant Settings and update the opening and closing times under Operations, then click Save changes.' },
  { q: 'Can I turn off online ordering temporarily?', a: 'Yes. In Restaurant Settings, switch off “Accept online orders”. Customers will see the restaurant as closed for orders.' },
  { q: 'How do I mark a menu item as sold out?', a: 'Go to Menu, find the item and switch its availability toggle off. It will be hidden from customers until you turn it back on.' },
  { q: 'Who can see my employees list?', a: 'Only accounts with manager access can view and manage the Employees page.' },
];

// ---------- Adapters for API records ----------

// Stable number from a string, used to give each restaurant its own placeholder colors.
function hashString(text) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

// Placeholder details for fields the backend doesn't store yet.
export function emptyDetails() {
  return {
    status: 'Active',
    coords: null,
    interiorHues: [],
    foodHues: [],
    contact: { phone: '—', whatsapp: '—', instagram: '—' },
    timing: { opening: '—', closing: '—', weeklyOff: '—' },
    menu: { veg: 0, nonVeg: 0, shakes: 0 },
    facilities: [],
    reviews: { rating: null, count: 0 },
    luxarPartner: false,
  };
}

// The backend stores { name, location } keyed by ID. Convert that to the UI's shape.
export function normalizeRestaurant(id, raw) {
  return {
    id: String(id),
    name: raw.name,
    address: raw.location,
    rating: null,
    employees: null,
    hue: hashString(String(id)) % 360,
    details: emptyDetails(),
  };
}
