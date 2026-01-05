import { connect, connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-reservation';

const productSchema = new (require('mongoose').Schema)({
  _id: String,
  name: String,
  stock: Number,
  expiryDate: Date,
});

async function seed() {
  try {
    await connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Product = connection.model('Product', productSchema);

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Seed products
    const products = [
      {
        _id: 'p1',
        name: 'Milk',
        stock: 50,
        expiryDate: new Date('2025-10-20T00:00:00.000Z'),
      },
      {
        _id: 'p2',
        name: 'Organic Eggs',
        stock: 100,
        expiryDate: new Date('2025-10-25T00:00:00.000Z'),
      },
      {
        _id: 'p3',
        name: 'Bread',
        stock: 30,
        expiryDate: new Date('2025-10-18T00:00:00.000Z'),
      },
      {
        _id: 'p4',
        name: 'Yogurt',
        stock: 0,
        expiryDate: new Date('2025-10-22T00:00:00.000Z'),
      },
    ];

    await Product.insertMany(products);
    console.log('Seeded products successfully:');
    products.forEach((p) => {
      console.log(`  - ${p._id}: ${p.name} (Stock: ${p.stock}, Expiry: ${p.expiryDate.toISOString().split('T')[0]})`);
    });

    await connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
