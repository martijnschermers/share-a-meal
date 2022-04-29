const Database = require('../database.js');
const assert = require('assert');
const Joi = require('joi');
const dbconnection = require('../../database/database');
let database = new Database();

let loggedInUser = null;

const schema = Joi.object({
  firstName: Joi.string().alphanum().required(),
  lastName: Joi.string().alphanum().required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
  email: Joi.string().email({ minDomainSegments: 2 }),
});

let controller = {
  validateUser: (req, res, next) => {
    let { firstName, lastName, emailAdress, password } = req.body;
    const { error, value } = schema.validate({ firstName: firstName, lastName: lastName, email: emailAdress, password: password });
    if (error) {
      const err = {
        status: 400,
        result: error.message
      };
      next(err);
    }
    next();
  },
  addUser: (req, res, next) => {
    dbconnection.getConnection(function (err, connection) {
      let user = req.body;

      if (err) throw err;
      connection.query('SELECT * FROM user', function (error, results, fields) {
        if (error) throw error;

        results = JSON.parse(JSON.stringify(results));

        if (results.filter(item => item.emailAdress === user.emailAdress).length === 0) {
          connection.query('INSERT INTO user SET ?', user, function (error, results, fields) {
            connection.release();
            if (error) throw error;
          });

          res.status(200).json({
            status: 200,
            result: results
          });
        } else {
          const err = {
            status: 401,
            result: 'Emailaddress is already taken'
          };
          next(err);
        }
      });
    });
  },
  getAllUsers: (req, res, next) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query('SELECT * FROM user', function (error, results, fields) {
        connection.release();
        if (error) throw error;

        results = JSON.parse(JSON.stringify(results));
        res.status(200).json({
          status: 200,
          result: results
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
    let user = req.body;
    let { emailAdress, password } = user;
    try {
      assert(typeof (emailAdress) === 'string', 'emailAdress must be a string');
      assert(typeof (password) === 'string', 'password must be a string');
      next();
    } catch (err) {
      const error = {
        status: 400,
        result: err.message
      };
      next(error);
    }
  },
  login: (req, res, next) => {
    let loginCredentials = req.body;

    let user = database.loginUser(loginCredentials);
    if (user) {
      loggedInUser = user;
      res.status(200).json({
        status: 200,
        result: user
      });
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
    dbconnection.getConnection(function (err, connection) {
      let id = req.params.id;

      if (err) throw err;

      connection.query(`SELECT * FROM user WHERE id = ${id}`, function (error, results, fields) {
        connection.release();
        if (error) throw error;

        if (results.length > 0) {
          results = JSON.parse(JSON.stringify(results));
          res.status(200).json({
            status: 200,
            result: results
          });
        } else {
          const error = {
            status: 404,
            result: 'User not found'
          };
          next(error);
        }
      });
    });
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
  deleteUser: (req, res, next) => {
    dbconnection.getConnection(function (err, connection) {
      let id = req.params.id;

      if (err) throw err;

      connection.query(`DELETE FROM user WHERE id = ${id}`, function (error, results, fields) {
        if (error) throw error;
        if (results.affectedRows == 0) {
          const error = {
            status: 404,
            result: 'User not found'
          };
          next(error);
        } else {
          res.status(200).json({
            status: 200,
            result: getAllUsers()
          });
        }
        console.log(results);
      });
    });
  },
}

module.exports = controller;