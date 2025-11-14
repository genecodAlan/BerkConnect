import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'SchoolConnect - Berkeley Prep',
  description:
    'Connect with your school community. Share updates, join clubs, and stay informed about campus life.',
  generator: 'v0.app',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes',
}

// ✅ Combine your fonts once outside the component (server-safe)
const fontVars = `${GeistSans.variable} ${GeistMono.variable}`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ✅ Apply deterministic, precomputed font vars */}
      <body className={`font-sans ${fontVars}`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false} // 🔧 make deterministic theme
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
