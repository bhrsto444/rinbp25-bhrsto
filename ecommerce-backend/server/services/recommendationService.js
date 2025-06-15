const mongoose = require('mongoose');
const UserProfile = require('../models/UserProfile');
const Product = require('../models/Product');

class RecommendationService {
  // Collaborative filtering based on user purchase history
  async getCollaborativeRecommendations(userId, limit = 5) {
    try {
      // Get the target user's profile
      const userProfile = await UserProfile.findOne({ userId });
      if (!userProfile) return [];

      // Get all user profiles
      const allProfiles = await UserProfile.find({ userId: { $ne: userId } });
      
      // Find similar users based on purchase history
      const similarUsers = this.findSimilarUsers(userProfile, allProfiles);
      
      // Get products that similar users bought but the target user hasn't
      const recommendations = await this.getProductsFromSimilarUsers(userProfile, similarUsers, limit);
      
      return recommendations;
    } catch (error) {
      console.error('Error in collaborative recommendations:', error);
      return [];
    }
  }

  // Content-based filtering based on product categories and user preferences
  async getContentBasedRecommendations(userId, limit = 5) {
    try {
      const userProfile = await UserProfile.findOne({ userId });
      if (!userProfile) return [];

      // Get user's preferred categories based on purchase history
      const preferredCategories = await this.getPreferredCategories(userProfile);
      
      // Find products in preferred categories
      const recommendations = await Product.find({
        category: { $in: preferredCategories },
        productId: { $nin: userProfile.purchaseHistory.map(p => p.productId) }
      })
      .limit(limit)
      .sort({ 'metadata.purchases': -1 });

      return recommendations;
    } catch (error) {
      console.error('Error in content-based recommendations:', error);
      return [];
    }
  }

  // Helper method to find similar users
  findSimilarUsers(targetUser, allUsers) {
    return allUsers
      .map(user => ({
        user,
        similarity: this.calculateSimilarity(targetUser, user)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  // Calculate similarity between two users using cosine similarity
  calculateSimilarity(user1, user2) {
    const user1Products = new Set(user1.purchaseHistory.map(p => p.productId));
    const user2Products = new Set(user2.purchaseHistory.map(p => p.productId));
    
    const intersection = new Set([...user1Products].filter(x => user2Products.has(x)));
    const union = new Set([...user1Products, ...user2Products]);
    
    return intersection.size / union.size;
  }

  // Get products from similar users
  async getProductsFromSimilarUsers(targetUser, similarUsers, limit) {
    const targetUserProducts = new Set(targetUser.purchaseHistory.map(p => p.productId));
    
    const recommendedProducts = new Set();
    for (const { user } of similarUsers) {
      for (const purchase of user.purchaseHistory) {
        if (!targetUserProducts.has(purchase.productId)) {
          recommendedProducts.add(purchase.productId);
        }
      }
    }

    return await Product.find({
      productId: { $in: Array.from(recommendedProducts) }
    }).limit(limit);
  }

  // Get user's preferred categories
  async getPreferredCategories(userProfile) {
    const categoryCount = {};
    for (const purchase of userProfile.purchaseHistory) {
      const product = await Product.findOne({ productId: purchase.productId });
      if (product && product.category) {
        const category = product.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    }

    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }

  // Update user preferences based on new purchases
  async updateUserPreferences(userId, productId) {
    try {
      const product = await Product.findOne({ productId });
      if (!product) return;

      await UserProfile.findOneAndUpdate(
        { userId },
        {
          $push: { preferences: product.category },
          $set: { lastUpdated: new Date() }
        }
      );

      // Update product metadata
      await Product.findOneAndUpdate(
        { productId },
        { $inc: { 'metadata.purchases': 1 } }
      );
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }
}

module.exports = new RecommendationService(); 

/*
Kako implementirati rekomendacije?



Logika preporuka (u recommendationService.js):
Preporučiteljski sustav koristi sljedeće pristupe:
Kolaborativno filtriranje (getCollaborativeRecommendations):
Ideja: "Korisnici koji su kupovali slične proizvode vjerojatno imaju slične interese." Sustav pronalazi druge korisnike čija je povijest kupnji slična povijesti kupnji ciljanog korisnika.
Logika:
Dohvati profil ciljanog korisnika i profile svih ostalih korisnika iz MongoDB userprofiles kolekcije.
Za svakog drugog korisnika, izračuna sličnost između njihove povijesti kupnji i povijesti kupnji ciljanog korisnika (calculateSimilarity). Naša implementacija koristi jednostavnu sličnost temeljenu na preklapanju kupljenih proizvoda (Jaccardova sličnost setova proizvoda).
Sortira korisnike po sličnosti i odabere najsličnije (npr. top 5).
Pregleda povijest kupnji tih najsličnijih korisnika i skuplja proizvode koje su oni kupili, ali ciljani korisnik nije.
Dohvati detalje tih proizvoda iz MongoDB products kolekcije i vraća ih kao preporuke.
Sadržajno filtriranje (getContentBasedRecommendations):
Ideja: "Korisnik će vjerojatno voljeti proizvode slične onima koje je već volio ili kupio." Sustav preporučuje proizvode na temelju atributa proizvoda koji se podudaraju s interesima korisnika.
Logika:
Dohvati profil ciljanog korisnika iz userprofiles.
Analizira korisnikovu purchaseHistory. Za svaki kupljeni proizvod, dohvaća njegovu kategoriju iz products kolekcije (koristeći getPreferredCategories).
Broji koliko puta se svaka kategorija pojavljuje u korisnikovoj povijesti kupnji kako bi odredio preferirane kategorije (npr. top 3 kategorije).
Pretražuje MongoDB products kolekciju za proizvode koji:
Pripadaju nekoj od korisnikovih preferiranih kategorija.
Nisu proizvodi koje je korisnik već kupio.
Sortira te proizvode (npr. po broju kupnji iz metadata) i vraća ih kao preporuke.
*/