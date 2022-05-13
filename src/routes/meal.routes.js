const express = require('express');
const router = express.Router();
const controller = require('../controllers/meal.controller');
const authController = require('../controllers/auth.controller');

router.post('/meal', authController.validateToken, controller.validateMeal, controller.addMeal);

router.get('/meal', controller.getAllMeals);

router.get('/meal/:id', controller.getMealById);

router.put('/meal/:id', authController.validateToken, controller.validateMeal, controller.updateMeal);

router.delete('/meal/:id', authController.validateToken, controller.deleteMeal);

router.get('/meal/:id/participate', authController.validateToken, controller.participate);

module.exports = router; 