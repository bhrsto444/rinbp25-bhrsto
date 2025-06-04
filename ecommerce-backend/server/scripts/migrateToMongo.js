const mongoose = require('mongoose');
const pool = require('../db/pg');
require('dotenv').config();

// MongoDB Schemas
const userProfileSchema = new mongoose.Schema({
  userId: String,
  purchaseHistory: [{
    productId: String,
    quantity: Number,
    purchaseDate: Date
  }],
  preferences: [String],
  lastUpdated: Date
});

const productSchema = new mongoose.Schema({
  productId: String,
  name: String,
  category: String,
  price: Number,
  description: String,
  metadata: {
    views: Number,
    purchases: Number
  }
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
const Product = mongoose.model('Product', productSchema);

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // 1. Migrate Products
    const productsResult = await pool.query('SELECT * FROM products');
    for (const product of productsResult.rows) {
      await Product.findOneAndUpdate(
        { productId: product.id },
        {
          $set: {
            name: product.name,
            category: product.label,
            price: product.price,
            description: product.description,
          },
          $setOnInsert: { // Postavi samo ako se dokument kreira (nije postojao) 
            metadata: {
              views: 0,
              purchases: 0
            }
          }
        },
        { upsert: true, new: true }
      );
    }
    console.log('Products migrated/updated successfully');

    // 2. Migrate User Purchase History
    const usersResult = await pool.query('SELECT id FROM users');
    for (const user of usersResult.rows) {
      // Get all orders for the user
      const ordersResult = await pool.query(
        `SELECT o.id, o.created_at, oi.product_id, oi.quantity
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         WHERE o.user_id = $1`,
        [user.id]
      );

      // Find or create user profile and update purchase history
      await UserProfile.findOneAndUpdate(
        { userId: user.id },
        {
          $set: {
            purchaseHistory: ordersResult.rows.map(order => ({
              productId: order.product_id,
              quantity: order.quantity,
              purchaseDate: order.created_at
            })),
            lastUpdated: new Date()
          }
        },
        { upsert: true, new: true }
      );
    }
    console.log('User profiles migrated/updated successfully');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    await pool.end();
  }
}

migrateData(); 