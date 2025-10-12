// Looks Routes
const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Looks routes working' });
});

module.exports = router;