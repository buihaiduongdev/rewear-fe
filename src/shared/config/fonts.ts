import localFont from 'next/font/local';

export const dmSans = localFont({
  src: '../../app/fonts/dm-sans-variable.ttf',
  variable: '--font-dm-sans',
  weight: '100 1000',
  style: 'normal',
  display: 'swap',
});

export const geistMono = localFont({
  src: '../../app/fonts/geist-mono-variable.ttf',
  variable: '--font-geist-mono',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
});
