const express = require('express');
const router = express.Router();
const aiController = require('./aiController');
const { protect } = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');

// Protected routes (Only logged in users can generate designs)
router.post('/generate', protect, (req, res, next) => aiController.generate(req, res, next));
router.get('/my-designs', protect, (req, res, next) => aiController.getMyDesigns(req, res, next));

module.exports = router;
