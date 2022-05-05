const express = require('express');
const router = express.Router();
const controller = require('../controllers/meal.controller');

router.post('/meal', controller.validateMeal, controller.addMeal);

router.get('/meal', controller.getAllMeals);

router.get('/meal/:id', controller.getMealById);

router.put('/meal/:id', controller.validateMeal, controller.updateMeal);

router.delete('/meal/:id', controller.deleteMeal);

router.get('/meal/:id/participate', controller.participate);

module.exports = router; 