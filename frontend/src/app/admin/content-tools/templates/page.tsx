'use client'

import { useState } from 'react'
import { 
  FileText, 
  Copy, 
  Edit, 
  Plus, 
  Trash2, 
  Save,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface ContentTemplate {
  id: string
  name: string
  category: string
  description: string
  wordCount: number
  estimatedTime: number // 分钟
  tags: string[]
  sections: {
    title: string
    prompt: string
    wordCount: number
    examples?: string[]
  }[]
  seoGuidelines?: {
    keywordDensity: string
    titleLength: string
    metaDescLength: string
  }
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([
    {
      id: 'ic-news-analysis',
      name: 'IC新闻深度分析',
      category: '新闻评论',
      description: '将简单新闻转化为深度分析文章',
      wordCount: 1200,
      estimatedTime: 30,
      tags: ['新闻', '分析', '评论'],
      sections: [
        {
          title: '新闻要点提炼',
          prompt: '用3-5个要点总结新闻核心内容，每个要点一句话',
          wordCount: 150,
          examples: [
            '• 台积电宣布3nm工艺量产，良率达到70%',
            '• 月产能将达到10万片晶圆',
            '• 苹果A17 Pro成为首个采用该工艺的芯片'
          ]
        },
        {
          title: '技术背景解读',
          prompt: '解释相关技术背景，让非专业读者也能理解',
          wordCount: 250,
          examples: [
            '3nm工艺相比5nm，晶体管密度提升33%，性能提升15%，功耗降低30%...'
          ]
        },
        {
          title: '产业链影响分析',
          prompt: '分析对上下游产业链的影响，包括供应商、客户、竞争对手',
          wordCount: 400,
          examples: [
            '对EDA工具商的影响：需要更新设计规则...',
            '对封测厂的影响：需要升级设备和工艺...',
            '对终端厂商的影响：产品性能大幅提升...'
          ]
        },
        {
          title: '市场趋势预判',
          prompt: '基于此新闻，预测未来6-12个月的市场变化',
          wordCount: 300,
          examples: [
            '预计其他晶圆厂将加速追赶...',
            '高端芯片市场格局可能重塑...'
          ]
        },
        {
          title: '投资机会提示',
          prompt: '为投资者提供相关投资机会和风险提示',
          wordCount: 100,
          examples: [
            '关注产业链相关公司股价变化...',
            '注意技术迭代带来的风险...'
          ]
        }
      ],
      seoGuidelines: {
        keywordDensity: '2-3%',
        titleLength: '50-60字符',
        metaDescLength: '150-160字符'
      }
    },
    {
      id: 'tech-tutorial',
      name: 'IC技术教程',
      category: '技术文档',
      description: '详细讲解IC设计和制造技术',
      wordCount: 2000,
      estimatedTime: 45,
      tags: ['教程', '技术', '入门'],
      sections: [
        {
          title: '学习目标',
          prompt: '明确本教程的学习目标和适用人群',
          wordCount: 100
        },
        {
          title: '前置知识',
          prompt: '列出学习本教程需要的基础知识',
          wordCount: 150
        },
        {
          title: '核心概念',
          prompt: '详细解释3-5个核心概念，配图说明',
          wordCount: 500
        },
        {
          title: '工作原理',
          prompt: '深入讲解技术原理，使用类比帮助理解',
          wordCount: 600
        },
        {
          title: '实践步骤',
          prompt: '提供详细的操作步骤，包括工具使用',
          wordCount: 400
        },
        {
          title: '常见错误',
          prompt: '列举初学者常犯的错误和解决方法',
          wordCount: 200
        },
        {
          title: '进阶资源',
          prompt: '推荐相关书籍、论文、在线课程',
          wordCount: 50
        }
      ]
    },
    {
      id: 'company-analysis',
      name: '企业深度分析',
      category: '商业分析',
      description: 'IC企业全面分析报告',
      wordCount: 1800,
      estimatedTime: 40,
      tags: ['企业', '分析', '投资'],
      sections: [
        {
          title: '公司概况',
          prompt: '介绍公司历史、规模、主营业务',
          wordCount: 200
        },
        {
          title: '核心技术评估',
          prompt: '分析公司的技术实力和专利布局',
          wordCount: 400
        },
        {
          title: '产品线分析',
          prompt: '详细介绍主要产品及其市场地位',
          wordCount: 300
        },
        {
          title: '财务状况',
          prompt: '分析营收、利润、研发投入等关键财务指标',
          wordCount: 300
        },
        {
          title: '竞争优势',
          prompt: '对比竞争对手，找出独特优势',
          wordCount: 300
        },
        {
          title: 'SWOT分析',
          prompt: '系统分析优势、劣势、机会、威胁',
          wordCount: 200
        },
        {
          title: '未来展望',
          prompt: '基于分析给出发展预测和投资建议',
          wordCount: 100
        }
      ]
    },
    {
      id: 'market-report',
      name: '市场研究报告',
      category: '市场分析',
      description: 'IC细分市场深度研究',
      wordCount: 2500,
      estimatedTime: 60,
      tags: ['市场', '研究', '报告'],
      sections: [
        {
          title: '执行摘要',
          prompt: '用200字概括报告核心观点',
          wordCount: 200
        },
        {
          title: '市场规模与增长',
          prompt: '提供具体数据，分析历史和预测未来',
          wordCount: 400
        },
        {
          title: '市场驱动因素',
          prompt: '分析推动市场增长的关键因素',
          wordCount: 350
        },
        {
          title: '技术发展路线',
          prompt: '梳理技术演进路径和未来方向',
          wordCount: 400
        },
        {
          title: '竞争格局',
          prompt: '分析主要玩家市场份额和竞争策略',
          wordCount: 500
        },
        {
          title: '区域市场分析',
          prompt: '对比不同地区市场特点',
          wordCount: 350
        },
        {
          title: '风险与机遇',
          prompt: '识别潜在风险和市场机会',
          wordCount: 200
        },
        {
          title: '结论与建议',
          prompt: '总结关键发现，提供行动建议',
          wordCount: 100
        }
      ]
    },
    {
      id: 'product-review',
      name: '芯片产品评测',
      category: '产品评测',
      description: '全面评测IC产品性能',
      wordCount: 1500,
      estimatedTime: 35,
      tags: ['评测', '产品', '性能'],
      sections: [
        {
          title: '产品定位',
          prompt: '介绍产品定位、目标市场和应用场景',
          wordCount: 150
        },
        {
          title: '规格参数',
          prompt: '详细列出技术规格，制作对比表格',
          wordCount: 200
        },
        {
          title: '架构解析',
          prompt: '深入分析芯片架构和设计特点',
          wordCount: 300
        },
        {
          title: '性能测试',
          prompt: '展示各项benchmark测试结果',
          wordCount: 400
        },
        {
          title: '功耗分析',
          prompt: '测试不同场景下的功耗表现',
          wordCount: 200
        },
        {
          title: '竞品对比',
          prompt: '与同级别产品进行全面对比',
          wordCount: 200
        },
        {
          title: '总结评分',
          prompt: '给出综合评分和购买建议',
          wordCount: 50
        }
      ]
    }
  ])

  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', '新闻评论', '技术文档', '商业分析', '市场分析', '产品评测']

  // 复制模板
  const copyTemplate = (template: ContentTemplate) => {
    const templateText = template.sections
      .map(s => `## ${s.title}\n${s.prompt}\n（约${s.wordCount}字）`)
      .join('\n\n')
    
    navigator.clipboard.writeText(templateText)
    toast.success('模板已复制到剪贴板')
  }

  // 使用模板创建文章
  const useTemplate = (template: ContentTemplate) => {
    // 跳转到AI写作助手，预加载模板
    const params = new URLSearchParams({
      template: template.id,
      title: template.name
    })
    window.location.href = `/admin/content-tools/ai-writer?${params}`
  }

  // 导出为JSON
  const exportTemplate = (template: ContentTemplate) => {
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.id}.json`
    a.click()
  }

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">内容模板库</h1>
        <p className="text-gray-600">预设的专业写作模板，快速生成高质量内容</p>
      </div>

      {/* 工具栏 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? '全部模板' : cat}</option>
              ))}
            </select>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            创建新模板
          </Button>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedTemplate(
                expandedTemplate === template.id ? null : template.id
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {template.wordCount}字
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.estimatedTime}分钟
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {template.tags.join(', ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      useTemplate(template)
                    }}
                  >
                    使用模板
                  </Button>
                  {expandedTemplate === template.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            {expandedTemplate === template.id && (
              <CardContent className="border-t">
                {/* 模板结构 */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-3">文章结构</h4>
                  <div className="space-y-3">
                    {template.sections.map((section, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{section.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{section.prompt}</p>
                          <p className="text-xs text-gray-500 mt-1">建议字数：{section.wordCount}字</p>
                          {section.examples && (
                            <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">示例：</p>
                              {section.examples.map((ex, i) => (
                                <p key={i} className="text-sm text-gray-700">{ex}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SEO指南 */}
                {template.seoGuidelines && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-3">SEO优化指南</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-gray-600">关键词密度</p>
                        <p className="font-semibold text-green-700">{template.seoGuidelines.keywordDensity}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-gray-600">标题长度</p>
                        <p className="font-semibold text-green-700">{template.seoGuidelines.titleLength}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-gray-600">描述长度</p>
                        <p className="font-semibold text-green-700">{template.seoGuidelines.metaDescLength}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyTemplate(template)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    复制模板
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportTemplate(template)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    导出JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTemplate(template.id)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* 快速提示 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            模板使用技巧
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">选择合适的模板</h4>
              <p className="text-sm text-gray-600">
                根据内容类型选择对应模板，可以大幅提高写作效率和内容质量。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">灵活调整结构</h4>
              <p className="text-sm text-gray-600">
                模板只是参考，可以根据实际需求增减章节或调整字数分配。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">积累个人模板</h4>
              <p className="text-sm text-gray-600">
                将成功的文章结构保存为模板，逐步建立个人模板库。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}