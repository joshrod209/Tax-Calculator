import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceMono = Space_Mono({ 
  subsets: ['latin'],
  weight: '700',
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  title: 'Federal Tax Calculator',
  description: 'Real-time federal income tax estimates for 2025 and 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}

