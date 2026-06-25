// Catálogo semilla de apps con clasificación de dopamina.
// category: 'dopamine'  -> consumo pasivo infinito (dosificar/bloquear)
//           'productive'-> herramientas con intención (lista blanca)
//           'neutral'   -> depende del uso
// minutesToday: uso simulado para el panel de estadísticas del prototipo.
export const SEED_APPS = [
  { id: 'tiktok',    name: 'TikTok',      emoji: '🎵', category: 'dopamine',   minutesToday: 84, note: 'Vídeo corto · scroll infinito' },
  { id: 'instagram', name: 'Instagram',   emoji: '📸', category: 'dopamine',   minutesToday: 62, note: 'Reels · feed infinito' },
  { id: 'youtube',   name: 'YouTube',     emoji: '▶️', category: 'dopamine',   minutesToday: 47, note: 'Shorts · autoplay' },
  { id: 'x',         name: 'X (Twitter)', emoji: '🐦', category: 'dopamine',   minutesToday: 38, note: 'Timeline infinito' },
  { id: 'reddit',    name: 'Reddit',      emoji: '👽', category: 'dopamine',   minutesToday: 24, note: 'Scroll infinito' },
  { id: 'games',     name: 'Juegos',      emoji: '🎮', category: 'dopamine',   minutesToday: 31, note: 'Casual · recompensas' },
  { id: 'facebook',  name: 'Facebook',    emoji: '👥', category: 'dopamine',   minutesToday: 12, note: 'Feed infinito' },
  { id: 'whatsapp',  name: 'WhatsApp',    emoji: '💬', category: 'neutral',    minutesToday: 41, note: 'Mensajería' },
  { id: 'spotify',   name: 'Spotify',     emoji: '🎧', category: 'neutral',    minutesToday: 35, note: 'Música' },
  { id: 'notion',    name: 'Notion',      emoji: '📝', category: 'productive', minutesToday: 22, note: 'Notas · trabajo' },
  { id: 'kindle',    name: 'Kindle',      emoji: '📚', category: 'productive', minutesToday: 18, note: 'Lectura' },
  { id: 'gmail',     name: 'Gmail',       emoji: '✉️', category: 'productive', minutesToday: 15, note: 'Correo' },
  { id: 'maps',      name: 'Maps',        emoji: '🗺️', category: 'productive', minutesToday: 8,  note: 'Navegación' },
  { id: 'bank',      name: 'Banco',       emoji: '🏦', category: 'productive', minutesToday: 4,  note: 'Finanzas' },
];

export const CATEGORY_META = {
  dopamine:   { label: 'Dopamina barata', color: 'text-rose-400',    dot: 'bg-rose-500' },
  neutral:    { label: 'Depende del uso', color: 'text-amber-400',   dot: 'bg-amber-500' },
  productive: { label: 'Productiva',      color: 'text-emerald-400', dot: 'bg-emerald-500' },
};
