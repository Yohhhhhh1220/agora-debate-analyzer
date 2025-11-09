import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
})

// サイトのベースURLを取得（環境変数から、またはVercelのURLから）
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'https://agora-debate-analyzer.vercel.app'
}

const baseUrl = getBaseUrl()

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'アゴラ - AIリアルタイムディベート分析サポート',
  description: 'AIリアルタイムディベート分析サポート。ディベートの正確性と論理性をAIがリアルタイムに判定・可視化します。',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'アゴラ - AIリアルタイムディベート分析サポート',
    description: 'AIリアルタイムディベート分析サポート。ディベートの正確性と論理性をAIがリアルタイムに判定・可視化します。',
    url: baseUrl,
    siteName: 'アゴラ',
    images: [
      {
        url: `${baseUrl}/logo.png`,
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
    images: [`${baseUrl}/logo.png`],
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

