import { Injectable, Logger } from '@nestjs/common';
import { writeFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ReservationEvent {
  reservationId: string;
  productId: string;
  quantity: number;
  timestamp: string;
}

@Injectable()
export class KafkaService {
  private readonly logger = new Logger(KafkaService.name);
  private readonly eventsFilePath = join(process.cwd(), 'kafka-events.log');

  async publishReservationEvent(event: ReservationEvent): Promise<void> {
    const message = {
      topic: 'reservations',
      ...event,
    };

    // Log to console
    this.logger.log(`Publishing to Kafka topic 'reservations': ${JSON.stringify(message)}`);

    // Write to file
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(message)}\n`;

    try {
      if (existsSync(this.eventsFilePath)) {
        appendFileSync(this.eventsFilePath, logEntry);
      } else {
        writeFileSync(this.eventsFilePath, logEntry);
      }
      this.logger.log('Event written to kafka-events.log');
    } catch (error) {
      this.logger.error('Failed to write event to file', error);
    }
  }

  async publishLowStockEvent(productId: string, stock: number): Promise<void> {
    const message = {
      topic: 'low-stock-detected',
      productId,
      stock,
      timestamp: new Date().toISOString(),
    }; 

    this.logger.log(`Publishing to Kafka topic 'low-stock-detected': ${JSON.stringify(message)}`);

    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(message)}\n`;

    try {
      if (existsSync(this.eventsFilePath)) {
        appendFileSync(this.eventsFilePath, logEntry);
      } else {
        writeFileSync(this.eventsFilePath, logEntry);
      }
    } catch (error) {
      this.logger.error('Failed to write low stock event to file', error);
    }
  }
}
