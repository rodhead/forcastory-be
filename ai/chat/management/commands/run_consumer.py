from django.core.management.base import BaseCommand

from chat.kafka_consumer import ChatKafkaConsumer


class Command(BaseCommand):
    help = "Run the Kafka consumer — listens for chat requests and calls Ollama"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting Forcastory AI consumer..."))
        ChatKafkaConsumer().run()
