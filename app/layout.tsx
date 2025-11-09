import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
})

export const metadata: Metadata = {
  title: 'アゴラ - AIリアルタイムディベート分析サポート',
  description: 'AIリアルタイムディベート分析サポート。ディベートの正確性と論理性をAIがリアルタイムに判定・可視化します。',
  openGraph: {
    title: 'アゴラ - AIリアルタイムディベート分析サポート',
    description: 'AIリアルタイムディベート分析サポート。ディベートの正確性と論理性をAIがリアルタイムに判定・可視化します。',
    siteName: 'アゴラ',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'アゴラ - AIリアルタイムディベート分析サポート',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'アゴラ - AIリアルタイムディベート分析サポート',
    description: 'AIリアルタイムディベート分析サポート。ディベートの正確性と論理性をAIがリアルタイムに判定・可視化します。',
    images: ['/logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className={`${notoSansJP.className} antialiased`}>{children}</body>
    </html>
  )
}

