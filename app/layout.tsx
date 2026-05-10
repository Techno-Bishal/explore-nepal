import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'
import { AITravelAssistant } from '@/components/ai-travel-assistant'
import Providers from './providers'

export const dynamic = "force-dynamic";

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'Explore Nepal - Discover the Beauty of the Himalayas',
  description: 'Your premium travel discovery platform for exploring the breathtaking destinations of Nepal. From the mighty Himalayas to serene lakes and ancient temples.',
  openGraph: {
    title: 'Explore Nepal - Discover the Beauty of the Himalayas',
    description: 'Your premium travel discovery platform for exploring the breathtaking destinations of Nepal.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className={`${dmSans.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} font-sans`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <AITravelAssistant />
            <Toaster />
            <ChunkLoadErrorHandler />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
