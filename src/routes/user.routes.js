const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');

router.post('/api/auth/login', controller.login);

router.post('/api/user', controller.validateUser, controller.addUser);

router.get('/api/user', controller.getAllUsers);

router.get('/api/user/profile', controller.getProfile);

router.get('/api/user/:id', controller.getUserById);

router.put('/api/user/:id', controller.updateUser);

router.delete('/api/user/:id', controller.deleteUser);

module.exports = router; 