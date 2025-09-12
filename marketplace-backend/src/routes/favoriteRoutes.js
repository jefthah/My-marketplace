const express = require('express');
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite,
  toggleFavorite
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Favorite routes
router.get('/', getFavorites);                           // GET /api/favorites - Get user's favorites
router.post('/toggle/:productId', toggleFavorite);       // POST /api/favorites/toggle/:productId - Toggle favorite
router.get('/check/:productId', checkFavorite);          // GET /api/favorites/check/:productId - Check if favorite
router.post('/:productId', addToFavorites);              // POST /api/favorites/:productId - Add to favorites
router.delete('/:productId', removeFromFavorites);       // DELETE /api/favorites/:productId - Remove from favorites

module.exports = router;
