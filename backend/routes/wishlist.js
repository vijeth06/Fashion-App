// Wishlist Routes
const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Wishlist routes working' });
});

module.exports = router;