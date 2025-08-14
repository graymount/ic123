/**
 * AI服务接口配置
 * 支持多种AI服务商，包括OpenAI、Claude、百度文心等
 */

interface AIServiceConfig {
  provider: string
  apiKey: string
  baseUrl?: string
  model?: string
}

interface GenerateOptions {
  prompt: string
  maxTokens?: number
  temperature?: number
  topP?: number
  stream?: boolean
}

interface ContentGenerationResult {
  content: string
  tokens?: number
  model?: string
}

class AIService {
  private config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.config = config
  }

  /**
   * 生成文章标题
   */
  async generateTitle(keyword: string, count: number = 10): Promise<string[]> {
    const prompt = `请为关于"${keyword}"的IC行业文章生成${count}个吸引人的标题。
要求：
1. 标题长度在15-30个字之间
2. 包含关键词
3. 有吸引力和专业性
4. 适合SEO优化
5. 每个标题一行，不要编号

关键词：${keyword}`

    const result = await this.generate({ prompt, temperature: 0.8 })
    return result.content.split('\n').filter(line => line.trim())
  }

  /**
   * 生成文章大纲
   */
  async generateOutline(title: string, template?: string): Promise<string[]> {
    const prompt = `为题为"${title}"的IC行业文章生成详细大纲。
${template ? `参考模板结构：${template}` : ''}
要求：
1. 包含5-8个主要章节
2. 每个章节标题简洁明了
3. 逻辑清晰，层次分明
4. 适合1500-2000字的文章
5. 每个章节标题一行，不要编号`

    const result = await this.generate({ prompt, temperature: 0.7 })
    return result.content.split('\n').filter(line => line.trim())
  }

  /**
   * 扩写段落
   */
  async expandParagraph(topic: string, point: string, wordCount: number = 300): Promise<string> {
    const prompt = `请就"${topic}"这个主题，详细展开以下要点：
${point}

要求：
1. 字数约${wordCount}字
2. 专业严谨，数据准确
3. 逻辑清晰，论述充分
4. 适合IC行业专业读者
5. 包含具体例子或数据支撑`

    const result = await this.generate({ prompt, temperature: 0.7 })
    return result.content
  }

  /**
   * 改写内容（避免重复）
   */
  async rewrite(content: string, style: 'professional' | 'casual' | 'technical' = 'professional'): Promise<string> {
    const styleGuide = {
      professional: '专业严谨，适合行业报告',
      casual: '通俗易懂，适合科普文章',
      technical: '技术深入，适合专业工程师'
    }

    const prompt = `请将以下内容改写，保持原意但完全重新表述：
${content}

改写要求：
1. 保持原文核心信息不变
2. 使用不同的句式和词汇
3. 风格：${styleGuide[style]}
4. 确保没有重复原文的句子
5. 字数保持相近`

    const result = await this.generate({ prompt, temperature: 0.8 })
    return result.content
  }

  /**
   * 提取关键词
   */
  async extractKeywords(content: string, count: number = 8): Promise<string[]> {
    const prompt = `从以下IC行业相关内容中提取${count}个最重要的关键词：
${content}

要求：
1. 选择最核心的专业术语
2. 包含技术名词和行业术语
3. 适合SEO优化
4. 每个关键词一行，用逗号分隔`

    const result = await this.generate({ prompt, temperature: 0.5 })
    return result.content.split(/[,，\n]/).map(k => k.trim()).filter(k => k)
  }

  /**
   * 生成SEO元描述
   */
  async generateMetaDescription(title: string, content: string): Promise<string> {
    const prompt = `为以下文章生成SEO元描述（meta description）：
标题：${title}
内容摘要：${content.substring(0, 500)}

要求：
1. 长度150-160个字符
2. 包含主要关键词
3. 吸引用户点击
4. 准确概括文章内容
5. 不要使用特殊符号`

    const result = await this.generate({ prompt, temperature: 0.7 })
    return result.content
  }

  /**
   * 事实核查
   */
  async factCheck(statement: string): Promise<{ isAccurate: boolean; explanation: string }> {
    const prompt = `请核查以下IC行业相关陈述的准确性：
"${statement}"

请回答：
1. 这个陈述是否准确？（是/否）
2. 解释原因（100字以内）
3. 如有错误，提供正确信息`

    const result = await this.generate({ prompt, temperature: 0.3 })
    const lines = result.content.split('\n')
    return {
      isAccurate: lines[0]?.includes('是'),
      explanation: lines.slice(1).join('\n')
    }
  }

  /**
   * 通用生成接口
   */
  private async generate(options: GenerateOptions): Promise<ContentGenerationResult> {
    // 根据不同的provider调用不同的API
    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAI(options)
      case 'claude':
        return this.callClaude(options)
      case 'wenxin':
        return this.callWenxin(options)
      default:
        // 默认使用模拟数据（用于开发测试）
        return this.mockGenerate(options)
    }
  }

  /**
   * OpenAI API调用
   */
  private async callOpenAI(options: GenerateOptions): Promise<ContentGenerationResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: [
          { role: 'system', content: '你是一位IC行业的专业内容创作者，精通半导体技术和市场分析。' },
          { role: 'user', content: options.prompt }
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 1,
        stream: options.stream || false
      })
    })

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      tokens: data.usage?.total_tokens,
      model: data.model
    }
  }

  /**
   * Claude API调用
   */
  private async callClaude(options: GenerateOptions): Promise<ContentGenerationResult> {
    // Claude API实现
    // 需要根据实际API文档调整
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-opus-20240229',
        messages: [
          { 
            role: 'user', 
            content: options.prompt 
          }
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7
      })
    })

    const data = await response.json()
    return {
      content: data.content[0].text,
      model: data.model
    }
  }

  /**
   * 百度文心API调用
   */
  private async callWenxin(options: GenerateOptions): Promise<ContentGenerationResult> {
    // 文心一言API实现
    // 需要根据实际API文档调整
    const response = await fetch(`${this.config.baseUrl}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: options.prompt }
        ],
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.8,
        penalty_score: 1,
        stream: false,
        access_token: this.config.apiKey
      })
    })

    const data = await response.json()
    return {
      content: data.result,
      tokens: data.usage?.total_tokens
    }
  }

  /**
   * 模拟生成（用于开发测试）
   */
  private async mockGenerate(options: GenerateOptions): Promise<ContentGenerationResult> {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 根据不同的prompt返回模拟数据
    if (options.prompt.includes('标题')) {
      return {
        content: `深度解析：技术革新与产业影响
引领IC行业的下一个十年
一文读懂核心技术与应用前景
全景分析：从原理到市场的完整解读
专家视角：如何改变半导体格局
技术白皮书：关键突破与实施路径
投资必读：商业价值与机会分析
性能、成本、前景全对比
从0到1完全指南
落地实践：挑战、机遇与解决方案`,
        tokens: 100
      }
    }

    if (options.prompt.includes('大纲')) {
      return {
        content: `技术背景与发展历程
核心技术原理解析
产业链影响分析
市场规模与增长预测
主要厂商竞争格局
应用场景与案例
风险与机遇评估
未来发展趋势展望`,
        tokens: 80
      }
    }

    // 默认返回
    return {
      content: `这是AI生成的关于IC行业的专业内容。${options.prompt.substring(0, 100)}...`,
      tokens: 150
    }
  }
}

// 创建AI服务实例
export const createAIService = (provider: string = 'mock'): AIService => {
  const configs: { [key: string]: AIServiceConfig } = {
    openai: {
      provider: 'openai',
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      model: 'gpt-4'
    },
    claude: {
      provider: 'claude',
      apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '',
      model: 'claude-3-opus-20240229'
    },
    wenxin: {
      provider: 'wenxin',
      apiKey: process.env.NEXT_PUBLIC_WENXIN_API_KEY || '',
      baseUrl: 'https://aip.baidubce.com'
    },
    mock: {
      provider: 'mock',
      apiKey: 'mock-key'
    }
  }

  return new AIService(configs[provider] || configs.mock)
}

// 导出默认实例
export const aiService = createAIService(process.env.NEXT_PUBLIC_AI_PROVIDER || 'mock')