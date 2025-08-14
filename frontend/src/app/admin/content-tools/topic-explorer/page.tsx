'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Search, RefreshCw, Zap, Hash, ExternalLink, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface HotTopic {
  id: string
  keyword: string
  searchVolume: number
  trend: number // 增长率
  category: string
  relatedKeywords: string[]
  contentIdeas: string[]
  lastUpdated: string
}

interface TrendSource {
  name: string
  topics: string[]
  url?: string
}

export default function TopicExplorerPage() {
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([])
  const [trendSources, setTrendSources] = useState<TrendSource[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // IC行业相关关键词库
  const icKeywords = {
    technology: ['RISC-V', '3nm', '5nm', 'EUV', 'FinFET', 'GAA', 'Chiplet', 'UCIe', 'HBM', 'DDR5'],
    companies: ['台积电', 'ASML', '英伟达', 'AMD', '高通', '联发科', '中芯国际', '华为海思'],
    applications: ['AI芯片', '车规级', '服务器芯片', 'GPU', 'NPU', 'DPU', '量子计算', 'FPGA'],
    industry: ['摩尔定律', '芯片短缺', '制程工艺', '封装技术', 'EDA工具', '晶圆代工', '半导体设备'],
    trends: ['国产替代', '算力', 'Chiplet', '先进封装', '存算一体', '硅光子', '碳基芯片']
  }

  // 模拟获取热点话题
  const fetchHotTopics = async () => {
    setIsLoading(true)
    try {
      // 这里实际应该调用真实的API，如Google Trends API、百度指数等
      // 现在使用模拟数据
      const mockTopics: HotTopic[] = [
        {
          id: '1',
          keyword: 'NVIDIA H200',
          searchVolume: 128500,
          trend: 45.2,
          category: 'AI芯片',
          relatedKeywords: ['HBM3e', 'AI训练', 'ChatGPT'],
          contentIdeas: [
            'H200与H100性能对比深度分析',
            'H200如何改变AI训练格局',
            'NVIDIA H200的技术创新解读'
          ],
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          keyword: 'RISC-V生态',
          searchVolume: 89300,
          trend: 32.8,
          category: '架构',
          relatedKeywords: ['开源处理器', 'ARM替代', 'SiFive'],
          contentIdeas: [
            'RISC-V在中国的发展机遇',
            '2024年RISC-V生态全景图',
            'RISC-V vs ARM：谁将主导未来'
          ],
          lastUpdated: new Date().toISOString()
        },
        {
          id: '3',
          keyword: '3nm良率',
          searchVolume: 76400,
          trend: 28.5,
          category: '制程',
          relatedKeywords: ['台积电', '三星', 'GAA工艺'],
          contentIdeas: [
            '台积电3nm良率突破的秘密',
            '3nm工艺的成本效益分析',
            '为什么3nm是关键节点'
          ],
          lastUpdated: new Date().toISOString()
        },
        {
          id: '4',
          keyword: 'Chiplet封装',
          searchVolume: 65200,
          trend: 52.3,
          category: '封装',
          relatedKeywords: ['UCIe标准', 'CoWoS', '先进封装'],
          contentIdeas: [
            'Chiplet如何突破摩尔定律限制',
            'UCIe标准的行业影响',
            'Chiplet封装技术全解析'
          ],
          lastUpdated: new Date().toISOString()
        },
        {
          id: '5',
          keyword: '车规级MCU',
          searchVolume: 58900,
          trend: 41.7,
          category: '汽车电子',
          relatedKeywords: ['功能安全', 'ISO26262', '域控制器'],
          contentIdeas: [
            '车规级MCU认证流程详解',
            '国产车规MCU的机遇与挑战',
            '新能源汽车MCU需求分析'
          ],
          lastUpdated: new Date().toISOString()
        }
      ]

      setHotTopics(mockTopics)

      // 获取趋势来源
      const sources: TrendSource[] = [
        {
          name: 'GitHub Trending',
          topics: ['RISC-V模拟器', 'FPGA开源项目', 'Verilog教程'],
          url: 'https://github.com/trending'
        },
        {
          name: '知乎热榜',
          topics: ['国产EDA现状', '芯片设计入门', '台积电vs中芯国际'],
          url: 'https://www.zhihu.com/hot'
        },
        {
          name: 'LinkedIn Pulse',
          topics: ['Semiconductor Shortage', 'AI Chip Market', 'EDA Tools'],
          url: 'https://www.linkedin.com/pulse'
        }
      ]
      setTrendSources(sources)

      toast.success('热点话题已更新')
    } catch (error) {
      toast.error('获取热点失败')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // 生成内容建议
  const generateContentIdeas = (topic: HotTopic) => {
    const ideas = [
      `深度解析：${topic.keyword}的技术原理与应用`,
      `${topic.keyword}市场分析：机遇与挑战`,
      `专家视角：${topic.keyword}的未来发展趋势`,
      `${topic.keyword}完全指南：从入门到精通`,
      `案例研究：${topic.keyword}在实际项目中的应用`
    ]
    return ideas
  }

  // 创建文章
  const createArticle = (topic: HotTopic, idea: string) => {
    // 跳转到AI写作助手，预填充主题
    window.location.href = `/admin/content-tools/ai-writer?topic=${encodeURIComponent(topic.keyword)}&title=${encodeURIComponent(idea)}`
  }

  useEffect(() => {
    fetchHotTopics()
  }, [])

  const filteredTopics = hotTopics.filter(topic => {
    if (selectedCategory !== 'all' && topic.category !== selectedCategory) {
      return false
    }
    if (searchQuery && !topic.keyword.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const categories = ['all', ...new Set(hotTopics.map(t => t.category))]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">热点话题挖掘器</h1>
        <p className="text-gray-600">发现IC行业热门话题，获取内容创作灵感</p>
      </div>

      {/* 工具栏 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索话题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? '全部分类' : cat}
              </option>
            ))}
          </select>

          <Button
            onClick={fetchHotTopics}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        </div>
      </div>

      {/* 热点话题卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {filteredTopics.map((topic) => (
          <Card key={topic.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Hash className="w-5 h-5 text-blue-500" />
                    {topic.keyword}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-gray-500">{topic.category}</span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 font-semibold">+{topic.trend}%</span>
                    </span>
                    <span className="text-gray-500">
                      搜索量: {(topic.searchVolume / 1000).toFixed(1)}K
                    </span>
                  </div>
                </div>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              {/* 相关关键词 */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">相关关键词:</p>
                <div className="flex flex-wrap gap-2">
                  {topic.relatedKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* 内容创意 */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">内容创意:</p>
                <div className="space-y-2">
                  {topic.contentIdeas.map((idea, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer group"
                      onClick={() => createArticle(topic, idea)}
                    >
                      <span className="text-sm text-gray-700">{idea}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => createArticle(topic, `${topic.keyword}深度分析`)}
                  className="flex-1"
                >
                  创建文章
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newIdeas = generateContentIdeas(topic)
                    setHotTopics(prev => prev.map(t => 
                      t.id === topic.id ? { ...t, contentIdeas: newIdeas } : t
                    ))
                  }}
                >
                  更多创意
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 趋势来源 */}
      <Card>
        <CardHeader>
          <CardTitle>趋势来源</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendSources.map((source, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{source.name}</h3>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="space-y-1">
                  {source.topics.map((topic, i) => (
                    <p key={i} className="text-sm text-gray-600">• {topic}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 关键词推荐 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>IC行业关键词库</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(icKeywords).map(([category, keywords]) => (
            <div key={category} className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2 capitalize">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(kw)}
                    className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 text-sm rounded-full transition-colors"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}