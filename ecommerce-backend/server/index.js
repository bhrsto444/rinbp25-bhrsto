const express = require('express');
const app = express();
const userRoutes = require('./routes/users');  // Import ruta za korisnike
const cartsRouter = require('./routes/carts');
const productsRouter = require('./routes/products');
const cartItemsRouter = require('./routes/cart_items');
const wishlistRouter = require('./routes/wishlist');
const recommendationsRouter = require('./routes/recommendations');

require('dotenv').config();
require('./db/pg');
require('./db/mongo');

app.use(express.json());

// Koristi rute za korisnike
app.use('/users', userRoutes);
app.use('/carts', cartsRouter);
app.use('/products', productsRouter);
app.use('/cart-items', cartItemsRouter);
app.use('/wishlist', wishlistRouter);
app.use('/recommendations', recommendationsRouter);

app.listen(3001, () => {
  console.log('🚀 Server running on http://localhost:3001');
});
