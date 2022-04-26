const Database = require('../database.js');
let database = new Database();
let loggedInUser = null;

let controller = {
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
      res.status(201).send(JSON.stringify(database.getAllUsers()));
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
      res.status(201).send(JSON.stringify(user));
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
      res.status(201).send(JSON.stringify(user));
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
        res.status(201).send(JSON.stringify(database.getAllUsers()));
        console.log("Update user with id: " + id);
      } else {
        res.status(404).json({
          status: 404,
          message: 'User not found'
        });
      }
    } else {
      res.status(400).json({
        status: 400,
        message: 'Not allowed to edit'
      });
    }
  },
  deleteUser: (req, res) => {
    let id = req.params.id;

    if (loggedInUser) {
      let deletedUser = database.deleteUser(id);
      
      if (deletedUser) {
        res.status(201).send(JSON.stringify(database.getAllUsers()));
        console.log("Deleted user with id: " + id);
      } else {
        res.status(404).json({
          status: 404,
          message: 'User not found'
        });
      }
    } else {
      res.status(400).json({
        status: 400,
        message: 'Not allowed to delete'
      });
    }
  }
}

module.exports = controller;