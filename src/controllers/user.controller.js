const Database = require('../database.js');
const assert = require('assert');
let database = new Database();
let loggedInUser = null;

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, emailAdress, password } = user;
    try {
      assert(typeof(firstName) === 'string', 'firstName must be a string');
      assert(typeof(lastName) === 'string', 'lastName must be a string');
      assert(typeof(emailAdress) === 'string', 'emailAdress must be a string');
      assert(typeof(password) === 'string', 'password must be a string');
      next();
    } catch (error) {
      res.status(400).json({
        status: 400,
        result: error.message
      });      
    }
  },
  addUser: (req, res) => {
    let user = req.body;
  
    let addedUser = database.addUser(user);
    if (addedUser) {
      res.status(201).send(JSON.stringify(database.getAllUsers()));
      console.log("Added user with email: " + user.emailAdress + " and password: " + user.password);
    } else {
      res.status(401).json({
        status: 401,
        message: 'Emailaddress is already taken'
      });
    }
  },
  getAllUsers: (req, res) => {
    if (loggedInUser) {
      res.status(200).send(JSON.stringify(database.getAllUsers()));
    } else {
      res.status(401).json({
        status: 401,
        message: 'Unauthorized. You need to create a new user first, and login, to get a valid JWT.'
      });
    }
  },
  getProfile: (req, res) => {
    if (loggedInUser) {
      res.status(200).send(JSON.stringify(loggedInUser));
      console.log("Get personal profile with id " + loggedInUser.id);
    } else {
      res.status(401).json({
        status: 401,
        message: 'No user logged in'
      });
    }
  },
  login: (req, res) => {
    let loginCredentials = req.body;

    let user = database.loginUser(loginCredentials);``
    if (user) {
      loggedInUser = user;
      res.status(200).send(JSON.stringify(user));
      console.log("Logged in with email: " + user.emailAdress + " and password: " + user.password);
    } else {
      res.status(401).json({
        status: 401,
        message: 'Invalid email or password'
      });
    }
  },
  getUserById: (req, res) => {
    let id = req.params.id;

    let user = database.getUser(id);
    if (user) {
      res.status(200).send(JSON.stringify(user));
      console.log("Got user with id " + id);
    } else {
      res.status(404).json({
        status: 404,
        message: 'User not found'
      });
      console.log("User with id " + id + " not found");
    }
  },
  updateUser: (req, res) => {
    let user = req.body;
    let id = req.params.id;

    if (loggedInUser) {
      let updatedUser = database.updateUser(id, user);

      if (updatedUser) {
        res.status(200).send(JSON.stringify(database.getAllUsers()));
        console.log("Update user with id: " + id);
      } else {
        res.status(404).json({
          status: 404,
          message: 'User not found'
        });
      }
    } else {
      res.status(401).json({
        status: 401,
        message: 'Not allowed to edit'
      });
    }
  },
  deleteUser: (req, res) => {
    let id = req.params.id;

    if (loggedInUser) {
      let deletedUser = database.deleteUser(id);
      
      if (deletedUser) {
        res.status(200).send(JSON.stringify(database.getAllUsers()));
        console.log("Deleted user with id: " + id);
      } else {
        res.status(404).json({
          status: 404,
          message: 'User not found'
        });
      }
    } else {
      res.status(401).json({
        status: 401,
        message: 'Not allowed to delete'
      });
    }
  }
}

module.exports = controller;