import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'ICRanking - 集成电路行业导航 | 专业的IC行业信息聚合平台',
    template: '%s | ICRanking'
  },
  description: '专业的IC行业信息聚合平台，为集成电路从业者提供精选的网站导航、最新行业资讯和优质公众号推荐。汇聚25+优质公众号，100+专业网站，实时更新行业动态。',
  keywords: ['IC', '集成电路', '半导体', '芯片', '导航', '新闻', '公众号', 'ICRanking', 'EDA', '制造', '设计'],
  authors: [{ name: 'ICRanking Team' }],
  creator: 'ICRanking',
  publisher: 'ICRanking',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://icranking.com'),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://icranking.com',
    title: 'ICRanking - 集成电路行业导航',
    description: '专业的IC行业信息聚合平台，为集成电路从业者提供精选的网站导航、最新行业资讯和优质公众号推荐。汇聚25+优质公众号，100+专业网站，实时更新行业动态。',
    siteName: 'ICRanking',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ICRanking - 集成电路行业导航',
    description: '专业的IC行业信息聚合平台，为集成电路从业者提供精选的网站导航、最新行业资讯和优质公众号推荐。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}