'''
import { Hono } from 'hono'
import { validator } from 'hono/validator'

// 定义翻译控制器
export const translateController = new Hono()

// 翻译接口的请求体校验
const translateValidator = validator('json', (value, c) => {
  const { text, target_lang } = value
  if (!text || typeof text !== 'string') {
    return c.json({ success: false, message: '缺少或无效的文本' }, 400)
  }
  if (!target_lang || typeof target_lang !== 'string') {
    return c.json({ success: false, message: '缺少或无效的目标语言' }, 400)
  }
  return { text, target_lang }
})

/**
 * @route   POST /api/translate
 * @desc    翻译文本
 * @access  Public
 */
translateController.post('/', translateValidator, async (c) => {
  const { text, target_lang } = c.req.valid('json')
  const { DEEPL_API_KEY } = c.env

  if (!DEEPL_API_KEY) {
    console.error('DeepL API Key未配置')
    return c.json({ success: false, message: '翻译服务未配置' }, 500)
  }

  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      },
      body: JSON.stringify({
        text: [text],
        target_lang: target_lang.toUpperCase(),
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('DeepL API 错误:', errorBody)
      return c.json({ success: false, message: `翻译服务调用失败: ${response.statusText}` }, 500)
    }

    const data = await response.json()
    const translatedText = data.translations[0].text

    return c.json({ 
      success: true, 
      data: { translatedText } 
    })
  } catch (error) {
    console.error('翻译请求异常:', error)
    return c.json({ success: false, message: '翻译过程中发生内部错误' }, 500)
  }
})
'''