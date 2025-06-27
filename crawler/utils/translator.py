import os
import httpx
from loguru import logger

DEEPL_API_KEY = os.getenv('DEEPL_API_KEY')
DEEPL_API_URL = "https://api-free.deepl.com/v2/translate"

async def translate_text(text: str, target_lang: str = "ZH") -> str:
    """使用DeepL API翻译文本"""
    if not DEEPL_API_KEY:
        logger.warning("DeepL API Key not found. Skipping translation.")
        return text

    if not text or not text.strip():
        return ""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                DEEPL_API_URL,
                headers={
                    "Authorization": f"DeepL-Auth-Key {DEEPL_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "text": [text],
                    "target_lang": target_lang.upper(),
                },
                timeout=30.0
            )
            response.raise_for_status()  # Raises HTTPStatusError for bad responses (4xx or 5xx)
            data = response.json()
            translated_text = data['translations'][0]['text']
            logger.info(f"Successfully translated text to {target_lang}")
            return translated_text
    except httpx.HTTPStatusError as e:
        logger.error(f"DeepL API returned an error: {e.response.status_code} - {e.response.text}")
        return text
    except httpx.RequestError as e:
        logger.error(f"An error occurred while requesting DeepL API: {e}")
        return text
    except Exception as e:
        logger.error(f"An unexpected error occurred during translation: {e}")
        return text
