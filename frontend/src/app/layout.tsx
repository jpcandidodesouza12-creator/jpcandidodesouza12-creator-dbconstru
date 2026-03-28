// frontend/src/app/layout.tsx
import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-barlow',
})
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-condensed',
})
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Dumb Construtor',
  description: 'Sistema de orçamento e gestão de obras residenciais — Campo Grande, MS',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${barlow.variable} ${barlowCondensed.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-bg text-tx font-sans antialiased min-h-screen">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1c2028', color: '#e2e6f0', border: '1px solid #2e3440', fontSize: '13px' },
            success: { iconTheme: { primary: '#4cde8a', secondary: '#0b0c10' } },
            error:   { iconTheme: { primary: '#ff6b6b', secondary: '#0b0c10' } },
          }}
        />
      </body>
    </html>
  )
}
