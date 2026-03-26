export const colors = {
  blue: { 500: '#3182F6', 100: '#E8F0FE' },
  gray: {
    900: '#191F28',
    700: '#333D4B',
    600: '#4E5968',
    400: '#8B95A1',
    200: '#E5E8EB',
    100: '#F2F4F6',
    50: '#F9FAFB',
  },
  red: { 500: '#F04452' },
  green: { 500: '#00C471' },
  orange: { 500: '#FF6B35' },
} as const;

export const typography = {
  hero: 'text-[28px] font-bold leading-[1.35]',
  title: 'text-[22px] font-bold leading-[1.4]',
  subtitle: 'text-[17px] font-semibold leading-[1.45]',
  body: 'text-[15px] font-normal leading-[1.6]',
  caption: 'text-[13px] font-normal leading-[1.5]',
  button: 'text-[16px] font-semibold leading-[1]',
  number: 'text-[36px] font-bold leading-[1.2]',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  full: '9999px',
} as const;
