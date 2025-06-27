"""
AI文章概要生成器
支持多种AI服务，用于生成新闻文章的智能概要
"""

import os
import asyncio
import aiohttp
import json
from typing import Optional, Dict, Any, List
from loguru import logger
from datetime import datetime

class AISummarizer:
    def __init__(self):
        """初始化AI概要生成器"""
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.claude_api_key = os.getenv('CLAUDE_API_KEY')
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        
        # 配置AI服务优先级
        self.preferred_service = os.getenv('AI_SUMMARY_SERVICE', 'openai')
        self.max_content_length = int(os.getenv('AI_MAX_CONTENT_LENGTH', '4000'))
        self.summary_max_length = int(os.getenv('AI_SUMMARY_MAX_LENGTH', '200'))
        
        # 验证配置
        self.available_services = self._check_available_services()
        if not self.available_services:
            logger.warning("No AI services configured. AI summary generation will be disabled.")

    def _check_available_services(self) -> List[str]:
        """检查可用的AI服务"""
        services = []
        if self.openai_api_key:
            services.append('openai')
        if self.claude_api_key:
            services.append('claude')
        if self.gemini_api_key:
            services.append('gemini')
        
        logger.info(f"Available AI services: {services}")
        return services

    async def generate_summary(self, title: str, content: str, source: str = '') -> Optional[Dict[str, Any]]:
        """
        生成文章概要
        
        Args:
            title: 文章标题
            content: 文章内容
            source: 新闻来源
            
        Returns:
            包含概要和关键词的字典，或None（如果生成失败）
        """
        if not self.available_services:
            logger.warning("No AI services available for summary generation")
            return None
        
        # 预处理内容
        processed_content = self._preprocess_content(title, content)
        if not processed_content:
            logger.warning("Content too short or invalid for AI processing")
            return None
        
        # 尝试生成概要
        for service in self._get_service_order():
            try:
                result = await self._generate_with_service(service, title, processed_content, source)
                if result:
                    logger.success(f"Generated AI summary using {service}")
                    return result
            except Exception as e:
                logger.error(f"Failed to generate summary with {service}: {e}")
                continue
        
        logger.error("All AI services failed to generate summary")
        return None

    def _get_service_order(self) -> List[str]:
        """获取AI服务尝试顺序"""
        services = self.available_services.copy()
        
        # 将首选服务放在最前面
        if self.preferred_service in services:
            services.remove(self.preferred_service)
            services.insert(0, self.preferred_service)
        
        return services

    def _preprocess_content(self, title: str, content: str) -> Optional[str]:
        """预处理文章内容"""
        if not content or len(content.strip()) < 50:
            return None
        
        # 限制内容长度
        if len(content) > self.max_content_length:
            content = content[:self.max_content_length] + "..."
        
        # 组合标题和内容
        return f"标题：{title}\n\n内容：{content}"

    async def _generate_with_service(self, service: str, title: str, content: str, source: str) -> Optional[Dict[str, Any]]:
        """使用指定服务生成概要"""
        if service == 'openai':
            return await self._generate_with_openai(title, content, source)
        elif service == 'claude':
            return await self._generate_with_claude(title, content, source)
        elif service == 'gemini':
            return await self._generate_with_gemini(title, content, source)
        else:
            raise ValueError(f"Unknown AI service: {service}")

    async def _generate_with_openai(self, title: str, content: str, source: str) -> Optional[Dict[str, Any]]:
        """使用OpenAI生成概要"""
        if not self.openai_api_key:
            return None
        
        prompt = self._create_summary_prompt(title, content, source)
        
        headers = {
            'Authorization': f'Bearer {self.openai_api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'gpt-3.5-turbo',
            'messages': [
                {'role': 'system', 'content': '你是一个专业的半导体行业新闻编辑，擅长生成简洁准确的新闻概要。'},
                {'role': 'user', 'content': prompt}
            ],
            'max_tokens': 300,
            'temperature': 0.3
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers=headers,
                    json=payload,
                    timeout=30
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_ai_response(data['choices'][0]['message']['content'])
                    else:
                        logger.error(f"OpenAI API error: {response.status}")
                        return None
        except Exception as e:
            logger.error(f"OpenAI request failed: {e}")
            return None

    async def _generate_with_claude(self, title: str, content: str, source: str) -> Optional[Dict[str, Any]]:
        """使用Claude生成概要"""
        if not self.claude_api_key:
            return None
        
        prompt = self._create_summary_prompt(title, content, source)
        
        headers = {
            'x-api-key': self.claude_api_key,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        }
        
        payload = {
            'model': 'claude-3-haiku-20240307',
            'max_tokens': 300,
            'messages': [
                {'role': 'user', 'content': prompt}
            ]
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    'https://api.anthropic.com/v1/messages',
                    headers=headers,
                    json=payload,
                    timeout=30
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_ai_response(data['content'][0]['text'])
                    else:
                        logger.error(f"Claude API error: {response.status}")
                        return None
        except Exception as e:
            logger.error(f"Claude request failed: {e}")
            return None

    async def _generate_with_gemini(self, title: str, content: str, source: str) -> Optional[Dict[str, Any]]:
        """使用Gemini生成概要"""
        if not self.gemini_api_key:
            return None
        
        prompt = self._create_summary_prompt(title, content, source)
        
        payload = {
            'contents': [{
                'parts': [{'text': prompt}]
            }],
            'generationConfig': {
                'maxOutputTokens': 400,
                'temperature': 0.1,
                'candidateCount': 1
            },
            'safetySettings': [
                {
                    'category': 'HARM_CATEGORY_HARASSMENT',
                    'threshold': 'BLOCK_NONE'
                },
                {
                    'category': 'HARM_CATEGORY_HATE_SPEECH',
                    'threshold': 'BLOCK_NONE'
                },
                {
                    'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    'threshold': 'BLOCK_NONE'
                },
                {
                    'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    'threshold': 'BLOCK_NONE'
                }
            ]
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_api_key}',
                    json=payload,
                    timeout=30
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if 'candidates' in data and len(data['candidates']) > 0:
                            candidate = data['candidates'][0]
                            if 'content' in candidate and 'parts' in candidate['content']:
                                text = candidate['content']['parts'][0]['text']
                                return self._parse_ai_response(text)
                        logger.error(f"Gemini response format error: {data}")
                        return None
                    else:
                        error_text = await response.text()
                        logger.error(f"Gemini API error: {response.status} - {error_text}")
                        return None
        except Exception as e:
            logger.error(f"Gemini request failed: {e}")
            return None

    def _create_summary_prompt(self, title: str, content: str, source: str) -> str:
        """创建AI概要生成提示词"""
        return f"""
请为以下半导体行业新闻生成一个简洁的概要，要求：

1. 概要长度控制在{self.summary_max_length}字以内
2. 突出新闻的核心内容和关键信息
3. 使用专业的半导体行业术语
4. 保持客观中性的语调
5. 同时提取3-5个关键词

新闻来源：{source}

{content}

请按以下JSON格式返回结果：
{{
    "summary": "新闻概要内容...",
    "keywords": ["关键词1", "关键词2", "关键词3"]
}}
"""

    def _parse_ai_response(self, response_text: str) -> Optional[Dict[str, Any]]:
        """解析AI响应"""
        try:
            # 尝试解析JSON格式的响应
            if '{' in response_text and '}' in response_text:
                # 提取JSON部分
                start = response_text.find('{')
                end = response_text.rfind('}') + 1
                json_str = response_text[start:end]
                
                result = json.loads(json_str)
                
                # 验证必要字段
                if 'summary' in result:
                    return {
                        'summary': result['summary'].strip(),
                        'keywords': result.get('keywords', []),
                        'generated_at': datetime.now().isoformat()
                    }
            
            # 如果不是JSON格式，尝试直接使用响应文本作为概要
            lines = response_text.strip().split('\n')
            summary = lines[0] if lines else response_text.strip()
            
            return {
                'summary': summary[:self.summary_max_length],
                'keywords': [],
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to parse AI response: {e}")
            return None

    def is_enabled(self) -> bool:
        """检查AI概要生成是否可用"""
        return len(self.available_services) > 0

    def get_stats(self) -> Dict[str, Any]:
        """获取AI服务状态统计"""
        return {
            'available_services': self.available_services,
            'preferred_service': self.preferred_service,
            'max_content_length': self.max_content_length,
            'summary_max_length': self.summary_max_length,
            'is_enabled': self.is_enabled()
        }


# 全局实例
ai_summarizer = AISummarizer()

async def generate_news_summary(title: str, content: str, source: str = '') -> Optional[Dict[str, Any]]:
    """
    生成新闻概要的便捷函数
    
    Args:
        title: 新闻标题
        content: 新闻内容
        source: 新闻来源
        
    Returns:
        AI生成的概要和关键词
    """
    return await ai_summarizer.generate_summary(title, content, source)


if __name__ == "__main__":
    # 测试代码
    async def test_summarizer():
        title = "华为发布新一代麒麟芯片"
        content = """
        华为今日正式发布了全新的麒麟9000S处理器，这款芯片采用了先进的5nm工艺制程，
        集成了华为自研的NPU神经网络处理单元。据悉，该芯片的CPU性能相比上一代提升了25%，
        GPU性能提升了30%，同时功耗降低了20%。华为表示，这款芯片将首先搭载在即将发布的
        Mate系列旗舰手机上，标志着华为在半导体设计领域的又一重要突破。
        """
        
        result = await generate_news_summary(title, content, "科技媒体")
        if result:
            print(f"概要: {result['summary']}")
            print(f"关键词: {result['keywords']}")
        else:
            print("概要生成失败")
    
    asyncio.run(test_summarizer())