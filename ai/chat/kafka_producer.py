import json
import logging
from datetime import datetime, timezone

from confluent_kafka import Producer
from django.conf import settings

logger = logging.getLogger(__name__)


class ChatKafkaProducer:
    TOPIC = "chat.responses"

    def __init__(self):
        self._producer = Producer({"bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS})

    def send_response(self, correlation_id: str, response: str, model: str) -> None:
        payload = json.dumps({
            "correlationId": correlation_id,
            "response": response,
            "model": model,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }).encode("utf-8")

        self._producer.produce(
            self.TOPIC,
            key=correlation_id.encode("utf-8"),
            value=payload,
            callback=self._on_delivery,
        )
        self._producer.flush()
        logger.info("Response sent: correlationId=%s, model=%s", correlation_id, model)

    @staticmethod
    def _on_delivery(err, msg):
        if err:
            logger.error("Delivery failed: %s", err)
        else:
            logger.debug("Delivered to %s[%d]", msg.topic(), msg.partition())
