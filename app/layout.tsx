import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Roboto_Serif } from 'next/font/google'
import './globals.css'

const robotoSerif = Roboto_Serif({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-roboto-serif',
})

export const metadata: Metadata = {
  title: 'Trò chơi đoán chữ',
  description: 'Đoán trúng có quà',
  openGraph: {
    title: 'Trò chơi đoán chữ',
    description: 'Đoán trúng có quà',
    type: 'website',
    locale: 'vi_VN',
    images: [{
      url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Culinary-okqptcDIMlKRma2ASYrg5J6IlVytpO.png',
      width: 1920,
      height: 1080,
      alt: 'Chiếc nón lên đỉnh Olympia — trò chơi đoán chữ',
    }],
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fdeedf',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={robotoSerif.variable}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
