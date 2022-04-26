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
    } catch (err) {
      const error = {
        status: 400,
        result: err.message
      };
      next(error); 
    }
  },
  addUser: (req, res, next) => {
    let user = req.body;
  
    let addedUser = database.addUser(user);
    if (addedUser) {
      res.status(201).send(JSON.stringify(database.getAllUsers()));
      console.log("Added user with email: " + user.emailAdress + " and password: " + user.password);
    } else {
      const error = {
        status: 401,
        result: 'Emailaddress is already taken'
      }; 
      next(error);
    }
  },
  getAllUsers: (req, res, next) => {
    if (loggedInUser) {
      res.status(200).send(JSON.stringify(database.getAllUsers()));
    } else {
      const error = {
        status: 401,
        result: 'Unauthorized. You need to create a new user first, and login, to get a valid JWT.'
      }; 
      next(error);
    }
  },
  getProfile: (req, res, next) => {
    if (loggedInUser) {
      res.status(200).send(JSON.stringify(loggedInUser));
      console.log("Get personal profile with id " + loggedInUser.id);
    } else {
      const error = {
        status: 401,
        result: 'No user logged in'
      }; 
      next(error);
    }
  },
  login: (req, res, next) => {
    let loginCredentials = req.body;

    let user = database.loginUser(loginCredentials);``
    if (user) {
      loggedInUser = user;
      res.status(200).send(JSON.stringify(user));
      console.log("Logged in with email: " + user.emailAdress + " and password: " + user.password);
    } else {
      const error = {
        status: 401,
        result: 'Invalid email or password'
      }; 
      next(error);
    }
  },
  getUserById: (req, res, next) => {
    let id = req.params.id;

    let user = database.getUser(id);
    if (user) {
      res.status(200).send(JSON.stringify(user));
      console.log("Got user with id " + id);
    } else {
      const error = {
        status: 404,
        result: 'User not found'
      }; 
      next(error);
      console.log("User with id " + id + " not found");
    }
  },
  updateUser: (req, res, next) => {
    let user = req.body;
    let id = req.params.id;

    if (loggedInUser) {
      let updatedUser = database.updateUser(id, user);

      if (updatedUser) {
        res.status(200).send(JSON.stringify(database.getAllUsers()));
        console.log("Update user with id: " + id);
      } else {
        const error = {
          status: 404,
          result: 'User not found'
        }; 
        next(error);
      }
    } else {
      const error = {
        status: 401,
        result: 'Not allowed to edit'
      }; 
      next(error);
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
        const error = {
          status: 404,
          result: 'User not found'
        }; 
        next(error);
      }
    } else {
      const error = {
        status: 401,
        result: 'Not allowed to delete'
      }; 
      next(error);
    }
  }
}

module.exports = controller;