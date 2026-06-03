import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

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
    url:      process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Blade Club',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
