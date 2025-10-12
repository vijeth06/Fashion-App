// Try-On Routes
const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Try-On routes working' });
});

module.exports = router;