import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Blade Club — Seu barbeiro. Onde você estiver.',
    template: '%s | Blade Club',
  },
  description:
    'Seu barbeiro. Onde você estiver. Barbeiros verificados a domicílio para executivos e profissionais em Curitiba. Agende agora.',
  keywords: ['barbeiro a domicílio', 'Curitiba', 'premium', 'Blade Club', 'agendamento'],
  openGraph: {
    type:     'website',
    locale:   'pt_BR',
    url:      'https://blade-club.vercel.app',
    siteName: 'Blade Club',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
