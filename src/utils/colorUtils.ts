export interface ColorOption {
  id: string;
  label: string;
  hex: string;
}

export const PRESET_COLORS: ColorOption[] = [
  { id: 'blue', label: 'Azul CCAA', hex: '#002B49' },
  { id: 'sky', label: 'Azul Céu', hex: '#0284C7' },
  { id: 'royal', label: 'Azul Royal', hex: '#2563EB' },
  { id: 'indigo', label: 'Índigo', hex: '#4F46E5' },
  { id: 'purple', label: 'Púrpura', hex: '#7C3AED' },
  { id: 'fuchsia', label: 'Fúcsia', hex: '#C026D3' },
  { id: 'rose', label: 'Rosa Carmim', hex: '#E11D48' },
  { id: 'orange', label: 'Laranja', hex: '#EA580C' },
  { id: 'amber', label: 'Âmbar', hex: '#D97706' },
  { id: 'emerald', label: 'Esmeralda', hex: '#059669' },
  { id: 'teal', label: 'Teal Petróleo', hex: '#0D9488' },
  { id: 'cyan', label: 'Ciano', hex: '#0891B2' },
  { id: 'slate', label: 'Grafite', hex: '#475569' }
];

export const getClassColorHex = (colorIdOrHex?: string): string => {
  if (!colorIdOrHex) return '#002B49';
  if (colorIdOrHex.startsWith('#')) return colorIdOrHex;
  const match = PRESET_COLORS.find(c => c.id === colorIdOrHex);
  return match ? match.hex : '#002B49';
};
