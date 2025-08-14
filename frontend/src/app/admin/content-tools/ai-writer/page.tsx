'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Wand2, 
  FileText, 
  Copy, 
  Download, 
  RefreshCw, 
  Save, 
  ChevronRight,
  Sparkles,
  Brain,
  ListOrdered,
  Edit3,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface WritingTemplate {
  id: string
  name: string
  description: string
  structure: {
    section: string
    wordCount: number
    guidance: string
  }[]
}

interface GeneratedContent {
  title: string
  outline: string[]
  sections: {
    name: string
    content: string
  }[]
  keywords: string[]
  metaDescription: string
}

export default function AIWriterPage() {
  const searchParams = useSearchParams()
  const [topic, setTopic] = useState(searchParams.get('topic') || '')
  const [title, setTitle] = useState(searchParams.get('title') || '')
  const [keywords, setKeywords] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('news-analysis')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  // 写作模板库
  const templates: WritingTemplate[] = [
    {
      id: 'news-analysis',
      name: '新闻深度分析',
      description: '适合分析行业新闻，提供深度见解',
      structure: [
        { section: '新闻概述', wordCount: 150, guidance: '简述新闻要点，突出核心信息' },
        { section: '背景介绍', wordCount: 200, guidance: '介绍相关背景，帮助读者理解' },
        { section: '深度分析', wordCount: 400, guidance: '分析影响、原因、技术细节等' },
        { section: '行业影响', wordCount: 300, guidance: '探讨对产业链的影响' },
        { section: '未来展望', wordCount: 200, guidance: '预测发展趋势和可能的变化' }
      ]
    },
    {
      id: 'tech-tutorial',
      name: '技术教程',
      description: '详细讲解技术原理和应用',
      structure: [
        { section: '引言', wordCount: 150, guidance: '介绍技术背景和学习目标' },
        { section: '基础概念', wordCount: 300, guidance: '解释核心概念和术语' },
        { section: '技术原理', wordCount: 500, guidance: '深入讲解工作原理' },
        { section: '实践应用', wordCount: 400, guidance: '具体应用案例和步骤' },
        { section: '常见问题', wordCount: 200, guidance: 'FAQ和注意事项' },
        { section: '总结', wordCount: 150, guidance: '回顾要点，提供进阶资源' }
      ]
    },
    {
      id: 'market-report',
      name: '市场分析报告',
      description: '分析市场趋势和商业机会',
      structure: [
        { section: '执行摘要', wordCount: 200, guidance: '报告核心观点总结' },
        { section: '市场现状', wordCount: 300, guidance: '当前市场规模、增长率、主要玩家' },
        { section: '技术趋势', wordCount: 350, guidance: '技术发展方向和创新点' },
        { section: '竞争格局', wordCount: 300, guidance: '主要厂商对比和市场份额' },
        { section: '机遇与挑战', wordCount: 250, guidance: '市场机会和潜在风险' },
        { section: '投资建议', wordCount: 200, guidance: '给出具体的行动建议' }
      ]
    },
    {
      id: 'product-review',
      name: '产品评测',
      description: '全面评测产品性能和价值',
      structure: [
        { section: '产品简介', wordCount: 150, guidance: '产品定位和基本信息' },
        { section: '规格参数', wordCount: 200, guidance: '详细技术规格' },
        { section: '性能测试', wordCount: 400, guidance: '各项性能指标测试结果' },
        { section: '优缺点分析', wordCount: 300, guidance: '客观评价优势和不足' },
        { section: '竞品对比', wordCount: 250, guidance: '与同类产品的对比' },
        { section: '购买建议', wordCount: 150, guidance: '适用人群和购买建议' }
      ]
    }
  ]

  // 生成标题建议
  const generateTitles = async () => {
    if (!topic) {
      toast.error('请先输入主题')
      return
    }

    setIsGenerating(true)
    try {
      // 模拟AI生成标题
      const titles = [
        `深度解析：${topic}的技术革新与产业影响`,
        `${topic}：引领IC行业的下一个十年`,
        `一文读懂${topic}的核心技术与应用前景`,
        `${topic}全景分析：从原理到市场的完整解读`,
        `专家视角：${topic}如何改变半导体格局`,
        `${topic}技术白皮书：关键突破与实施路径`,
        `投资必读：${topic}的商业价值与机会分析`,
        `${topic} vs 传统方案：性能、成本、前景全对比`,
        `从0到1：${topic}完全指南`,
        `${topic}落地实践：挑战、机遇与解决方案`
      ]

      // 显示标题选择对话框
      const selectedTitle = titles[0] // 实际应该让用户选择
      setTitle(selectedTitle)
      toast.success('标题生成成功')
    } catch (error) {
      toast.error('生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 生成文章大纲
  const generateOutline = async () => {
    if (!title) {
      toast.error('请先设置文章标题')
      return
    }

    setIsGenerating(true)
    try {
      const template = templates.find(t => t.id === selectedTemplate)!
      const outline = template.structure.map(s => s.section)
      
      setGeneratedContent({
        title,
        outline,
        sections: [],
        keywords: extractKeywords(topic + ' ' + title),
        metaDescription: `深度解析${topic}，了解最新技术趋势和行业影响。`
      })
      
      toast.success('大纲生成成功')
    } catch (error) {
      toast.error('生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 生成段落内容
  const generateSection = async (sectionName: string, guidance: string, wordCount: number) => {
    setIsGenerating(true)
    try {
      // 模拟AI生成内容
      const content = generateMockContent(sectionName, topic, wordCount)
      
      setGeneratedContent(prev => {
        if (!prev) return null
        const existingSection = prev.sections.find(s => s.name === sectionName)
        if (existingSection) {
          existingSection.content = content
          return { ...prev }
        } else {
          return {
            ...prev,
            sections: [...prev.sections, { name: sectionName, content }]
          }
        }
      })
      
      toast.success(`${sectionName}生成成功`)
    } catch (error) {
      toast.error('生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 模拟生成内容（实际应调用AI API）
  const generateMockContent = (section: string, topic: string, wordCount: number): string => {
    const templates: { [key: string]: string } = {
      '新闻概述': `近日，${topic}领域迎来重大突破。据业内权威消息，这一技术革新将对整个IC产业产生深远影响。多家领先企业已经开始布局相关技术，预计将在未来几个月内看到实质性进展。这一发展不仅标志着技术的重要里程碑，更预示着产业格局的潜在变革。`,
      
      '背景介绍': `${topic}技术的发展可以追溯到几年前，当时业界普遍面临着性能瓶颈和成本压力。传统解决方案已经难以满足日益增长的需求，迫切需要新的技术突破。在这样的背景下，${topic}应运而生，它不仅解决了现有问题，还开辟了全新的应用场景。`,
      
      '深度分析': `从技术层面分析，${topic}的核心创新在于其独特的架构设计和优化算法。与传统方案相比，它在性能上提升了40%，功耗降低了30%，成本也控制在合理范围内。这些优势使得${topic}在激烈的市场竞争中脱颖而出。更重要的是，它的可扩展性为未来发展留下了充足空间。技术实现上采用了最新的工艺制程，确保了产品的可靠性和稳定性。`,
      
      '行业影响': `${topic}的出现将对整个产业链产生连锁反应。上游供应商需要调整生产策略，中游制造商要更新工艺流程，下游应用厂商则获得了新的产品机会。预计在未来2-3年内，相关市场规模将达到数百亿美元。这不仅会改变现有的竞争格局，还将催生新的商业模式。`,
      
      '未来展望': `展望未来，${topic}技术还有巨大的发展潜力。随着工艺的不断成熟和应用场景的拓展，预计将在更多领域发挥作用。业内专家预测，下一代${topic}将在性能上再提升50%，同时成本将进一步下降。这将为整个行业带来新的增长动力。`
    }
    
    return templates[section] || `这是关于${topic}中${section}部分的详细内容。[此处应包含约${wordCount}字的专业分析...]`
  }

  // 提取关键词
  const extractKeywords = (text: string): string[] => {
    const commonWords = ['的', '是', '在', '和', '了', '有', '我', '你', '他', '它', '为']
    const words = text.split(/\s+|[，。！？、]/g)
      .filter(w => w.length > 1 && !commonWords.includes(w))
      .slice(0, 8)
    return [...new Set(words)]
  }

  // 改写/润色内容
  const polishContent = async (content: string): Promise<string> => {
    // 模拟AI润色
    return content.replace(/\n/g, '\n\n')
      .replace(/。/g, '。\n')
      .trim()
  }

  // 导出文章
  const exportArticle = () => {
    if (!generatedContent) {
      toast.error('请先生成内容')
      return
    }

    const fullContent = generatedContent.sections
      .map(s => `## ${s.name}\n\n${s.content}`)
      .join('\n\n')
    
    const article = `# ${generatedContent.title}\n\n${fullContent}\n\n---\n关键词：${generatedContent.keywords.join(', ')}`
    
    const blob = new Blob([article], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedContent.title}.md`
    a.click()
    
    toast.success('文章已导出')
  }

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }

  const currentTemplate = templates.find(t => t.id === selectedTemplate)!

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI写作助手</h1>
        <p className="text-gray-600">智能生成高质量原创内容</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：输入和控制 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 主题输入 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                写作主题
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                placeholder="输入文章主题，如：RISC-V架构"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="添加关键词"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget
                      if (input.value) {
                        setKeywords([...keywords, input.value])
                        input.value = ''
                      }
                    }
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              {keywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full cursor-pointer"
                      onClick={() => setKeywords(keywords.filter((_, i) => i !== idx))}
                    >
                      {kw} ×
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 模板选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                写作模板
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-600">
                {currentTemplate.description}
              </p>
              <div className="mt-3 text-xs text-gray-500">
                总字数：{currentTemplate.structure.reduce((sum, s) => sum + s.wordCount, 0)}字
              </div>
            </CardContent>
          </Card>

          {/* 生成控制 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                内容生成
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={generateTitles}
                disabled={isGenerating || !topic}
                className="w-full justify-center"
                variant="outline"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                生成标题建议
              </Button>
              <Button
                onClick={generateOutline}
                disabled={isGenerating || !title}
                className="w-full justify-center"
                variant="outline"
              >
                <ListOrdered className="w-4 h-4 mr-2" />
                生成文章大纲
              </Button>
              <Button
                onClick={() => {
                  currentTemplate.structure.forEach(s => {
                    generateSection(s.section, s.guidance, s.wordCount)
                  })
                }}
                disabled={isGenerating || !generatedContent}
                className="w-full justify-center"
                variant="primary"
              >
                <Zap className="w-4 h-4 mr-2" />
                一键生成全文
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：内容预览和编辑 */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <input
                    type="text"
                    placeholder="文章标题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  {generatedContent?.metaDescription && (
                    <p className="text-sm text-gray-600 mt-2">{generatedContent.metaDescription}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (contentRef.current) {
                        copyToClipboard(contentRef.current.innerText)
                      }
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportArticle}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={contentRef} className="prose max-w-none">
                {generatedContent ? (
                  <div>
                    {/* 大纲 */}
                    {generatedContent.outline.length > 0 && generatedContent.sections.length === 0 && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-3">文章大纲</h3>
                        <ol className="space-y-2">
                          {generatedContent.outline.map((item, idx) => (
                            <li key={idx} className="flex items-center justify-between">
                              <span>{idx + 1}. {item}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const template = currentTemplate.structure[idx]
                                  if (template) {
                                    generateSection(template.section, template.guidance, template.wordCount)
                                  }
                                }}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* 生成的内容 */}
                    {generatedContent.sections.map((section, idx) => (
                      <div key={idx} className="mb-6">
                        <h2 className="text-xl font-semibold mb-3">{section.name}</h2>
                        <div 
                          className="text-gray-700 whitespace-pre-wrap"
                          contentEditable
                          suppressContentEditableWarning
                        >
                          {section.content}
                        </div>
                      </div>
                    ))}

                    {/* 关键词 */}
                    {generatedContent.keywords.length > 0 && (
                      <div className="mt-8 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          关键词：{generatedContent.keywords.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Wand2 className="w-12 h-12 mx-auto mb-4" />
                    <p>设置主题并选择模板，开始生成内容</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}