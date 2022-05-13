const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

router.post('/user', controller.validateUser, controller.addUser);

router.get('/user', authController.validateToken, controller.getAllUsers);

router.get('/user/profile', authController.validateToken, controller.getProfile);

router.get('/user/:id', authController.validateToken, controller.getUserById);

router.put('/user/:id', authController.validateToken, controller.validateUpdate, controller.updateUser);

router.delete('/user/:id', authController.validateToken, controller.deleteUser);

module.exports = router; 