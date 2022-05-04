const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');

router.post('/auth/login', controller.validateLogin, controller.login);

router.post('/user', controller.validateUser, controller.addUser);

router.get('/user', controller.getAllUsers);

router.get('/user/profile', controller.getProfile);

router.get('/user/:id', controller.getUserById);

router.put('/user/:id', controller.validateUpdate, controller.updateUser);

router.delete('/user/:id', controller.deleteUser);

module.exports = router; 