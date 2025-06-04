const express = require('express');
const router = express.Router();
const recommendationService = require('../services/recommendationService');

// GET /recommendations/:user_id - Get recommendations for a user
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { type = 'both', limit = 5 } = req.query;

    let recommendations = [];

    if (type === 'collaborative' || type === 'both') {
      const collaborativeRecs = await recommendationService.getCollaborativeRecommendations(user_id, limit);
      recommendations = recommendations.concat(collaborativeRecs);
    }

    if (type === 'content' || type === 'both') {
      const contentRecs = await recommendationService.getContentBasedRecommendations(user_id, limit);
      recommendations = recommendations.concat(contentRecs);
    }

    // Remove duplicates and limit results
    const uniqueRecommendations = Array.from(new Set(recommendations.map(r => r.productId)))
      .map(id => recommendations.find(r => r.productId === id))
      .slice(0, limit);

    res.json(uniqueRecommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Error getting recommendations' });
  }
});

// POST /recommendations/:user_id/update - Update user preferences after purchase
router.post('/:user_id/update', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required' });
    }

    await recommendationService.updateUserPreferences(user_id, product_id);
    res.json({ message: 'User preferences updated successfully' });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Error updating user preferences' });
  }
});

module.exports = router; 