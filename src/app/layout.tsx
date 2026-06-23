import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/Header'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '냉장고 레시피 | AI로 냉장고 재료를 분석하고 레시피를 추천받아보세요',
  description:
    '냉장고 사진을 찍으면 AI가 재료를 인식하고, 맞춤 레시피를 추천해드립니다. 유통기한 임박 재료를 우선 사용하는 똑똑한 레시피 추천 서비스.',
  keywords: ['냉장고', '레시피', 'AI', '식재료', '요리', '유통기한', '추천'],
  openGraph: {
    title: '냉장고 레시피 - AI 레시피 추천',
    description: '냉장고 사진 한 장으로 뚝딱! AI가 알려주는 오늘의 레시피',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Header />
          <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
