const Joi = require('joi');
const database = require('../../database/database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    const schema = Joi.object({
      firstName: Joi.string().alphanum().required(),
      lastName: Joi.string().alphanum().required(),
      password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
      street: Joi.string().required(),
      city: Joi.string().alphanum().required(),
      emailAdress: Joi.string().email({ minDomainSegments: 2 }),
    });
    const { error } = schema.validate(user);
    if (error) {
      const err = {
        status: 400,
        // Error message wrapped variable in /" "\ for some reason
        message: error.message.replace(/"/g, '')
      };
      next(err);
    }
    next();
  },
  addUser: (req, res, next) => {
    database.getConnection(function (err, connection) {
      let user = req.body;

      if (err) throw err;
      connection.query('SELECT * FROM user;', function (error, results, fields) {
        if (error) throw error;

        if (results.filter(item => item.emailAdress === user.emailAdress).length === 0) {
          bcrypt.hash(user.password, saltRounds, function(err, hash) {
            user.password = hash; 

            // Multiple queries in one function is made possible due to the multipleStatements option in database.js 
            connection.query('INSERT INTO user SET ?; SELECT * FROM user;', user, function (error, results, fields) {
              connection.release();
              if (error) throw error;

              res.status(201).json({
                status: 201,
                result: results[1]
              });
            });
          });
        } else {
          const err = {
            status: 409,
            message: 'Emailaddress is already taken'
          };
          next(err);
        }
      });
    });
  },
  getAllUsers: (req, res) => {
    let { name, isActive } = req.query;
    let query = 'SELECT * FROM user';

    if (name || isActive) {
      query += ' WHERE ';
      if (name) {
        query += `firstName LIKE "%${name}%"`;
      }

      if (name && isActive) {
        query += ' AND ';
      }

      if (isActive) {
        query += `isActive = ${isActive}`;
      }
    }

    query += ';';

    database.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(query, function (error, results, fields) {
        connection.release();
        if (error) throw error;

        res.status(200).json({
          status: 200,
          result: results
        });
      });
    });
  },
  getProfile: (req, res, next) => {
    let id = req.userId;
    if (id) {
      database.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query('SELECT * FROM user WHERE id = ?;', [id], function (error, results, fields) {
          connection.release();
          if (error) throw error;

          if (results.length > 0) {
            res.status(200).json({
              status: 200,
              result: results[0]
            });
          } else {
            const err = {
              status: 404,
              message: 'User not found'
            };
            next(err);
          }
        });
      });
    } else {
      const error = {
        status: 401,
        message: 'No user logged in'
      };
      next(error);
    }
  },
  getUserById: (req, res, next) => {
    database.getConnection(function (err, connection) {
      let id = req.params.id;

      if (err) throw err;

      connection.query('SELECT * FROM user WHERE id = ?;', [id], function (error, results, fields) {
        connection.release();
        if (error) throw error;

        if (results.length > 0) {
          res.status(200).json({
            status: 200,
            result: results
          });
        } else {
          const error = {
            status: 404,
            message: 'User not found'
          };
          next(error);
        }
      });
    });
  },
  validateUpdate: (req, res, next) => {
    let { firstName, lastName, emailAdress, password, phoneNumber } = req.body;
    const schema = Joi.object({
      firstName: Joi.string().alphanum().required(),
      lastName: Joi.string().alphanum().required(),
      password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      phoneNumber: Joi.string().length(10).pattern(/^\d+$/).required(),
    });
    const { error } = schema.validate({ firstName: firstName, lastName: lastName, email: emailAdress, password: password, phoneNumber: phoneNumber });
    if (error) {
      const err = {
        status: 400,
        // Error message wrapped variable in /" "\ for some reason
        message: error.message.replace(/"/g, '')
      };
      next(err);
    }
    next();
  },
  updateUser: (req, res, next) => {
    let id = req.params.id;
    let { firstName, lastName, emailAdress, password, phoneNumber, street, city } = req.body;

    database.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query('SELECT * FROM user WHERE id = ?; SELECT * FROM user WHERE emailAdress = ?;', [id, emailAdress], function (error, results, fields) {
        if (error) throw error;

        if (results[0].length > 0) {
          if (results[1].length === 0) {
            connection.query(
              `UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, phoneNumber = ?, street = ?, city = ? WHERE id = ?; 
              SELECT * FROM user WHERE id = ?;`,
              [firstName, lastName, emailAdress, password, phoneNumber, street, city, id, id], function (error, results, fields) {
                connection.release();
                if (error) throw error;

                res.status(200).json({
                  status: 200,
                  result: results[1]
                });
              });
          } else {
            const error = {
              status: 409,
              message: 'Email already in use'
            };
            next(error);
          }
        } else {
          const error = {
            status: 400,
            message: 'User does not exist'
          };
          next(error);
        }
      });
    });
  },
  deleteUser: (req, res, next) => {
    database.getConnection(function (err, connection) {
      let id = req.params.id;

      if (err) throw err;

      connection.query(`DELETE FROM user WHERE id = ?; SELECT * FROM user;`, [id], function (error, results, fields) {
        if (error) throw error;

        if (results[0].affectedRows > 0) {
          res.status(200).json({
            status: 200,
            result: results[1]
          });
        } else {
          const error = {
            status: 400,
            message: 'User not found'
          };
          next(error);
        }
      });
    });
  },
}

module.exports = controller;