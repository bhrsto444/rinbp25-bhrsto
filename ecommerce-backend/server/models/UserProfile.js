const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  purchaseHistory: [{
    productId: String,
    quantity: Number,
    purchaseDate: Date
  }],
  preferences: [String],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserProfile', userProfileSchema); 