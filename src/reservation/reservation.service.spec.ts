/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Product } from '../schemas/product.schema';
import { Reservation } from '../schemas/reservation.schema';
import { KafkaService } from '../services/kafka.service';
import { RedisService } from '../services/redis.service';

describe('ReservationService', () => {
  let service: ReservationService;
  let mockProductModel: any;
  let mockReservationModel: any;
  let mockKafkaService: any;
  let mockRedisService: any;

  beforeEach(async () => {
    mockProductModel = {
      findById: jest.fn(),
      find: jest.fn(),
    };

    mockReservationModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(data),
    }));
    mockReservationModel.findById = jest.fn();

    mockKafkaService = {
      publishReservationEvent: jest.fn(),
    };

    mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(Reservation.name),
          useValue: mockReservationModel,
        },
        {
          provide: KafkaService,
          useValue: mockKafkaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReservation', () => {
    it('should create a reservation successfully', async () => {
      const mockProduct = {
        _id: 'p1',
        name: 'Test Product',
        stock: 10,
        expiryDate: new Date('2025-10-20'),
        save: jest.fn().mockResolvedValue(true),
      };

      mockRedisService.get.mockResolvedValue(null);
      mockProductModel.findById.mockResolvedValue(mockProduct);

      const result = await service.createReservation({
        productId: 'p1',
        quantity: 3,
      });

      expect(result).toHaveProperty('reservationId');
      expect(result.productId).toBe('p1');
      expect(result.quantity).toBe(3);
      expect(mockProduct.stock).toBe(7);
      expect(mockKafkaService.publishReservationEvent).toHaveBeenCalled();
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockProductModel.findById.mockResolvedValue(null);

      await expect(
        service.createReservation({
          productId: 'invalid',
          quantity: 3,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when not enough stock', async () => {
      const mockProduct = {
        _id: 'p1',
        name: 'Test Product',
        stock: 2,
        expiryDate: new Date('2025-10-20'),
      };

      mockRedisService.get.mockResolvedValue(null);
      mockProductModel.findById.mockResolvedValue(mockProduct);

      await expect(
        service.createReservation({
          productId: 'p1',
          quantity: 5,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getReservation', () => {
    it('should return a reservation by id', async () => {
      const mockReservation = {
        _id: 'r1',
        productId: 'p1',
        quantity: 3,
        createdAt: new Date(),
      };

      mockReservationModel.findById.mockResolvedValue(mockReservation);

      const result = await service.getReservation('r1');

      expect(result).toEqual({
        reservationId: 'r1',
        productId: 'p1',
        quantity: 3,
        createdAt: mockReservation.createdAt,
      });
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      mockReservationModel.findById.mockResolvedValue(null);

      await expect(service.getReservation('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getExpiringProducts', () => {
    it('should return expiring product IDs', async () => {
      const mockProducts = [
        {
          _id: 'p1',
          name: 'Product 1',
          stock: 10,
          expiryDate: new Date('2025-10-18'),
        },
        {
          _id: 'p2',
          name: 'Product 2',
          stock: 20,
          expiryDate: new Date('2025-11-01'),
        },
      ];

      mockProductModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProducts),
      });

      // Mock current date
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-16'));

      const result = await service.getExpiringProducts(5);

      expect(result).toContain('p1');
      expect(result).not.toContain('p2');

      jest.useRealTimers();
    });
  });
});
