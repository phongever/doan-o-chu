import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Roboto_Serif } from 'next/font/google'
import './globals.css'

const robotoSerif = Roboto_Serif({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-roboto-serif',
})

export const metadata: Metadata = {
  title: 'Ô chữ bí ẩn — Trò chơi đoán chữ',
  description: 'Trò chơi đoán chữ đơn giản: mở từng ô chữ, thêm người chơi và theo dõi điểm số.',
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
