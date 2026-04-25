import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class OllamaClient:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL

    def chat(self, message: str) -> str:
        logger.info("Ollama request: model=%s, message=%.80s", self.model, message)
        try:
            response = requests.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": message}],
                    "stream": False,
                },
                timeout=120,
            )
            response.raise_for_status()
            content = response.json()["message"]["content"]
            logger.info("Ollama response: %.80s", content)
            return content
        except requests.exceptions.ConnectionError:
            logger.error("Cannot connect to Ollama at %s", self.base_url)
            return f"Error: Ollama is not running. Start it with: ollama serve"
        except requests.exceptions.Timeout:
            logger.error("Ollama request timed out")
            return "Error: AI response timed out. Try a shorter message."
        except Exception as e:
            logger.exception("Unexpected Ollama error")
            return f"Error: {str(e)}"
