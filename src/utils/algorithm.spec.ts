import { findExpiring } from './algorithm';

describe('findExpiring', () => {
  beforeEach(() => {
    // Mock current date to 2025-10-16
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-16T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return products expiring within specified days', () => {
    const products = [ 
      { id: 'p1', expiry: '2025-10-18T00:00:00.000Z', stock: 10 },
      { id: 'p2', expiry: '2025-10-20T00:00:00.000Z', stock: 20 },
      { id: 'p3', expiry: '2025-10-25T00:00:00.000Z', stock: 30 },
    ];

    const result = findExpiring(products, 5);

    expect(result).toEqual(['p1', 'p2']);
  });

  it('should return empty array when no products expire within specified days', () => {
    const products = [
      { id: 'p1', expiry: '2025-11-01T00:00:00.000Z', stock: 10 },
      { id: 'p2', expiry: '2025-11-15T00:00:00.000Z', stock: 20 },
    ];

    const result = findExpiring(products, 5);

    expect(result).toEqual([]);
  });

  it('should not include expired products (before current date)', () => {
    const products = [
      { id: 'p1', expiry: '2025-10-10T00:00:00.000Z', stock: 10 },
      { id: 'p2', expiry: '2025-10-18T00:00:00.000Z', stock: 20 },
    ];

    const result = findExpiring(products, 5);

    expect(result).toEqual(['p2']);
  });

  it('should handle edge case of exact expiry date', () => {
    const products = [
      { id: 'p1', expiry: '2025-10-21T00:00:00.000Z', stock: 10 },
    ];

    const result = findExpiring(products, 5);

    expect(result).toEqual(['p1']);
  });

  it('should return empty array for empty products list', () => {
    const result = findExpiring([], 5);

    expect(result).toEqual([]);
  });

  it('should handle products with different stock levels', () => {
    const products = [
      { id: 'p1', expiry: '2025-10-18T00:00:00.000Z', stock: 0 },
      { id: 'p2', expiry: '2025-10-19T00:00:00.000Z', stock: 100 },
    ];

    const result = findExpiring(products, 5);

    expect(result).toEqual(['p1', 'p2']);
  });
});
