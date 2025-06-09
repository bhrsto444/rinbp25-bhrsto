const mongoose = require('mongoose');
const UserProfile = require('../models/UserProfile');
const Product = require('../models/Product');
require('dotenv').config();

async function recalculatePurchases() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    console.log('Calculating total purchases per product...');
    const productPurchaseCounts = {}; // { productId: totalQuantity }

    // 1. Iterate through all user profiles and sum up quantities for each product
    const userProfiles = await UserProfile.find({});
    for (const userProfile of userProfiles) {
      if (userProfile.purchaseHistory && userProfile.purchaseHistory.length > 0) {
        for (const purchase of userProfile.purchaseHistory) {
          if (purchase.productId && purchase.quantity) {
            const productId = purchase.productId;
            const quantity = purchase.quantity;
            productPurchaseCounts[productId] = (productPurchaseCounts[productId] || 0) + quantity;
          }
        }
      }
    }

    console.log('Updating product metadata.purchases in MongoDB...');

    // 2. Update the metadata.purchases field for each product
    let updatedCount = 0;
    for (const productId in productPurchaseCounts) {
      if (productPurchaseCounts.hasOwnProperty(productId)) {
        const totalQuantity = productPurchaseCounts[productId];
        
        await Product.findOneAndUpdate(
          { productId: productId },
          { $set: { 'metadata.purchases': totalQuantity } },
          { new: true }
        );
        updatedCount++;
      }
    }

    console.log(`✅ Successfully updated metadata.purchases for ${updatedCount} products.`);

  } catch (error) {
    console.error('❌ Error during recalculation:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed.');
    }
  }
}

recalculatePurchases(); 