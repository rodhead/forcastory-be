import json
import logging

from confluent_kafka import Consumer, KafkaError
from django.conf import settings

from .kafka_producer import ChatKafkaProducer
from .ollama_client import OllamaClient

logger = logging.getLogger(__name__)


class ChatKafkaConsumer:
    TOPIC = "chat.requests"

    def __init__(self):
        self._consumer = Consumer({
            "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
            "group.id": "forcastory-ai",
            "auto.offset.reset": "earliest",
        })
        self._producer = ChatKafkaProducer()
        self._ollama = OllamaClient()

    def run(self) -> None:
        self._consumer.subscribe([self.TOPIC])
        logger.info("Subscribed to %s — waiting for messages...", self.TOPIC)

        try:
            while True:
                msg = self._consumer.poll(timeout=1.0)
                if msg is None:
                    continue
                if msg.error():
                    if msg.error().code() != KafkaError._PARTITION_EOF:
                        logger.error("Kafka error: %s", msg.error())
                    continue

                try:
                    data = json.loads(msg.value().decode("utf-8"))
                    self._handle(data)
                except Exception:
                    logger.exception("Failed to handle message")
        except KeyboardInterrupt:
            logger.info("Consumer stopped")
        finally:
            self._consumer.close()

    def _handle(self, data: dict) -> None:
        correlation_id = data.get("correlationId", "")
        message_type = data.get("messageType", "CHAT")
        tenant_id = data.get("tenantId", "unknown")

        logger.info("Received %s: correlationId=%s, tenant=%s", message_type, correlation_id, tenant_id)

        if message_type == "PING":
            self._producer.send_response(correlation_id, "pong", "system")
            return

        user_message = data.get("message", "")
        response = self._ollama.chat(user_message)
        self._producer.send_response(correlation_id, response, self._ollama.model)
