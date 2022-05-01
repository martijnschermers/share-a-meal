const Database = require('../database.js');
const assert = require('assert');
const Joi = require('joi');
const dbconnection = require('../../database/database');
let database = new Database();

let loggedInUser = null;

let controller = {
  validateUser: (req, res, next) => {
    let { firstName, lastName, emailAdress, password } = req.body;
    const schema = Joi.object({
      firstName: Joi.string().alphanum().required(),
      lastName: Joi.string().alphanum().required(),
      password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
      email: Joi.string().email({ minDomainSegments: 2 }),
    });
    const { error, value } = schema.validate({ firstName: firstName, lastName: lastName, email: emailAdress, password: password });
    if (error) {
      const err = {
        status: 400,
        // Error message wrapped variable in /""\ for some reason
        result: error.message.replace(/"/g, '')
      };
      next(err);
    }
    next();
  },
  addUser: (req, res, next) => {
    let user = req.body;

    let addedUser = database.addUser(user);
    if (addedUser) {
      res.status(201).json({
        status: 201,
        result: database.getAllUsers()
      });
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
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; 

      connection.query('SELECT * FROM user', function (error, results, fields) {
        connection.release();

        if (error) throw error;

        res.status(200).json({
          status: 200,
          result: results[0].name
        });
      });
    });
  },
  getProfile: (req, res, next) => {
    if (loggedInUser) {
      res.status(200).json({
        status: 200,
        result: loggedInUser
      });
      console.log("Get personal profile with id " + loggedInUser.id);
    } else {
      const error = {
        status: 401,
        result: 'No user logged in'
      };
      next(error);
    }
  },
  validateLogin: (req, res, next) => {
    let { emailAdress, password } = req.body;
    const schema = Joi.object({
      password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
      email: Joi.string().email({ minDomainSegments: 2 }),
    });
    const { error, value } = schema.validate({ email: emailAdress, password: password });
    if (error) {
      const err = {
        status: 401,
        // Error message wrapped variable in /""\ for some reason
        result: error.message.replace(/"/g, '')
      };
      next(err);
    }

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; 

      connection.query(`SELECT * FROM user WHERE emailAdress = '${emailAdress}' AND password = '${password}'`, function (error, results, fields) {
        connection.release();

        if (error) throw error;

        if (results.length > 0) {
          next();
        } else {
          const error = {
            status: 401,
            result: 'Wrong email or password'
          };
          next(error);
        }
      });
    });
  },
  login: (req, res, next) => {
    let { emailAdress } = req.body;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; 
      connection.query(`SELECT * FROM user WHERE emailAdress = '${emailAdress}'`, function (error, results, fields) {
        connection.release();

        if (error) throw error;

        res.status(200).json({
          status: 200,
          result: results[0]
        });
      });
    });
  },
  getUserById: (req, res, next) => {
    let id = req.params.id;

    let user = database.getUser(id);
    if (user) {
      res.status(200).json({
        status: 200,
        result: user
      });
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

    let updatedUser = database.updateUser(id, user);

    if (updatedUser) {
      res.status(200).json({
        status: 200,
        result: database.getAllUsers()
      });
      console.log("Update user with id: " + id);
    } else {
      const error = {
        status: 400,
        result: 'User not found'
      };
      next(error);
    }
  },
  deleteUser: (req, res) => {
    let id = req.params.id;

    if (loggedInUser) {
      let deletedUser = database.deleteUser(id);

      if (deletedUser) {
        res.status(200).json({
          status: 200,
          result: database.getAllUsers()
        });
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