import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PIKK Bots — Tu chatbot de IA self-hosted',
  description: 'Chatbot de IA para WhatsApp, Instagram y Telegram. Self-hosted en Vercel + Supabase.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
