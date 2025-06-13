// src/routes/chargers.js
const express = require('express');
const {
  getChargers,
  getCharger,
  createCharger,
  updateCharger,
  deleteCharger
} = require('../controllers/chargerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router
  .route('/')
  .get(getChargers)
  .post(createCharger);

router
  .route('/:id')
  .get(getCharger)
  .put(updateCharger)
  .delete(deleteCharger);

module.exports = router;