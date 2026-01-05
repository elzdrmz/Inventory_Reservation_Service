const { MongoClient } = require('mongodb');

// Simulated Kafka publisher
async function publishLowStockEvent(productId, stock) {
  console.log(JSON.stringify({
    topic: 'low-stock-detected',
    productId, 
    stock,
    timestamp: new Date().toISOString(),
  }));
}

exports.handler = async (event) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('inventory-reservation');
    const products = database.collection('products');

    // Find products with stock <= 0
    const lowStockProducts = await products.find({ stock: { $lte: 0 } }).toArray();

    console.log(`Found ${lowStockProducts.length} products with low or zero stock`);

    // Log results
    for (const product of lowStockProducts) {
      console.log(`Low Stock Alert: Product ${product._id} (${product.name}) has stock: ${product.stock}`);

      // Optional bonus: Publish Kafka event
      await publishLowStockEvent(product._id, product.stock);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Low stock check completed',
        lowStockCount: lowStockProducts.length,
        products: lowStockProducts.map(p => ({
          id: p._id,
          name: p.name,
          stock: p.stock,
        })),
      }),
    };
  } catch (error) {
    console.error('Error checking low stock:', error);
    throw error;
  } finally {
    await client.close();
  }
};
