// Placeholder "photo" gradients used until real images are supplied.
const norm = (h) => ((h % 360) + 360) % 360;

export function photoStyle(hue, variant = 0) {
  const base = norm(hue + variant * 12);
  const accent = norm(base + 20);
  return {
    background: `
      radial-gradient(circle at 30% 70%, hsla(${accent}, 70%, 75%, 0.9), transparent 55%),
      linear-gradient(135deg, hsl(${base}, 45%, 55%), hsl(${norm(accent + 5)}, 40%, 30%))
    `,
  };
}
