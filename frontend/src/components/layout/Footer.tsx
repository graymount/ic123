'use client'

import Link from 'next/link'
import { Github, Mail, MessageCircle, ExternalLink } from 'lucide-react'

const footerLinks = {
  product: [
    { name: '网站导航', href: '/websites' },
    { name: '行业新闻', href: '/news' },
    { name: '公众号推荐', href: '/wechat' },
    { name: '用户反馈', href: '/feedback' },
  ],
  resources: [
    { name: '关于我们', href: '/about' },
    { name: '使用说明', href: '/help' },
    { name: '隐私政策', href: '/privacy' },
    { name: '服务条款', href: '/terms' },
  ],
  community: [
    { name: 'GitHub', href: 'https://github.com', icon: Github },
    { name: '联系邮箱', href: 'mailto:contact@ic123.com', icon: Mail },
    { name: '意见反馈', href: '/feedback', icon: MessageCircle },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                IC
              </div>
              <span className="text-xl font-bold text-gray-900">IC123</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              专业的IC行业信息聚合平台，为集成电路从业者提供精选的网站导航、最新行业资讯和优质公众号推荐。
            </p>
            <div className="mt-4 flex space-x-4">
              {footerLinks.community.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              产品功能
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resource Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              帮助资源
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats or Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              平台数据
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">收录网站</span>
                <span className="font-medium text-gray-900">200+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">新闻更新</span>
                <span className="font-medium text-gray-900">每日</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">公众号</span>
                <span className="font-medium text-gray-900">50+</span>
              </div>
            </div>
            
            {/* Quick Action */}
            <div className="mt-6">
              <Link
                href="/feedback"
                className="inline-flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <span>推荐网站或公众号</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} IC123. 专注IC行业信息聚合服务.
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-6 text-sm text-gray-500">
              <span>基于 Next.js 构建</span>
              <span>•</span>
              <span>数据来源于公开渠道</span>
              <span>•</span>
              <Link
                href="/sitemap"
                className="hover:text-gray-700 transition-colors"
              >
                网站地图
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}