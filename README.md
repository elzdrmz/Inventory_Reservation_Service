# Inventory Reservation Service

This project was developed as part of a backend developer case study. A simple inventory reservation service built with NestJS, TypeScript, and MongoDB.
It includes basic REST APIs, Kafka event publishing (simulated), and an example algorithm for expiring products.
Optional features like Redis caching, unit tests, and AWS CDK are also included for demonstration.

## Features

- **REST API Endpoints**  Reserve products and fetch reservation details
- **MongoDB Integration** Persistent storage for products and reservations
- **Redis Caching** Optional caching layer for improved performance
- **Kafka Event Publishing** Simulated event publishing to file and console
- **Algorithm Function** Find products expiring within N days
- **Unit Tests** - Comprehensive Jest test coverage
- **AWS CDK** - Infrastructure as code for EventBridge and Lambda
- **TypeScript** - Fully typed codebase

## Project Structure

inventory-reservation-service/
├── src/
│   ├── database/
│   │   └── seed.ts                    # Database seeding script
│   ├── dto/
│   │   └── create-reservation.dto.ts  # Request validation DTOs
│   ├── reservation/
│   │   ├── reservation.controller.ts   # API endpoints
│   │   ├── reservation.service.ts      # Business logic
│   │   ├── reservation.module.ts       # NestJS module
│   │   └── reservation.service.spec.ts # Unit tests
│   ├── schemas/
│   │   ├── product.schema.ts          # Product MongoDB schema
│   │   └── reservation.schema.ts      # Reservation MongoDB schema
│   ├── services/
│   │   ├── kafka.service.ts           # Kafka simulation service
│   │   └── redis.service.ts           # Redis caching service
│   ├── utils/
│   │   ├── algorithm.ts               # Expiring products algorithm
│   │   └── algorithm.spec.ts          # Algorithm unit tests
│   ├── app.module.ts                  # Root application module
│   └── main.ts                        # Application entry point
├── cdk/
│   ├── bin/
│   │   └── cdk.ts                     # CDK app entry point
│   ├── lib/
│   │   └── inventory-monitoring-stack.ts # CDK infrastructure stack
│   └── lambda/
│       └── check-low-stock/
│           ├── index.js               # Lambda function code
│           └── package.json           # Lambda dependencies
├── package.json
├── tsconfig.json
└── README.md

## Installation

npm install
cp .env.example .env

## Example .env

MONGODB_URI=mongodb://localhost:27017/inventory-reservation
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000

## Start MongoDB

mongod

## Start Redis

redis-server

## Seed the database

npm run seed

## API Endpoints

**Post /reserve:**

Creates a new reservation if stock is available.

{
  "productId": "p1",
  "quantity": 3
}

**Response (201):**

{
  "reservationId": "abc123",
  "productId": "p1",
  "quantity": 3,
  "createdAt": "2025-10-16T00:00:00.000Z"
}

**Error (400):**

{ "error": "Not enough stock available" }

**GET /reservations/:id**

Fetch a reservation by its ID.

**Response (200):**

{
  "reservationId": "abc123",
  "productId": "p1",
  "quantity": 3,
  "createdAt": "2025-10-16T00:00:00.000Z"
}

**Error (404):**

{ "error": "Reservation not found" }

## Kafka Event Simulation

When a reservation is created, an event is logged and written to kafka-events.log:

{
  "topic": "reservations",
  "reservationId": "abc123",
  "productId": "p1",
  "quantity": 3,
  "timestamp": "2025-10-16T00:00:00.000Z"
}

## Redis Caching

- Product lookups are cached for 5 minutes

- Cache key format: product:{productId}

- Cache is invalidated when stock changes

## AWS CDK

Includes an example AWS CDK stack that:

- Defines a Lambda (CheckLowStockLambda)

- Runs every 6 hours via EventBridge

- Finds products with stock <= 0 and logs them

## Database Schema

Product

{
  _id: string;
  name: string;
  stock: number;
  expiryDate: Date;
}

Reservation

{
  _id: string;
  productId: string;
  quantity: number;
  createdAt: Date;
}

## Error Handling

- 400 → Invalid request or not enough stock

- 404 → Product or reservation not found

- 500 → Database or internal error
