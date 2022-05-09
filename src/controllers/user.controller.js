const Joi = require('joi');
const database = require('../../database/database');

let loggedInUser = null;

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
      connection.query('SELECT * FROM user', function (error, results, fields) {
        if (error) throw error;

        if (results.filter(item => item.emailAdress === user.emailAdress).length === 0) {
          // Multiple queries in one function is made possible due to the multipleStatements option in database.js 
          connection.query('INSERT INTO user SET ?; SELECT * FROM user;', user, function (error, results, fields) {
            connection.release();
            if (error) throw error;

            res.status(200).json({
              status: 200,
              result: results[1]
            });
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
  getAllUsers: (req, res) => {
    database.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query('SELECT * FROM user', function (error, results, fields) {
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
    res.status(501).json({
      status: 501,
      result: 'Not implemented'
    });

    // if (loggedInUser) {
    //   res.status(200).json({
    //     status: 200,
    //     result: loggedInUser
    //   });
    //   console.log("Get personal profile");
    // } else {
    //   const error = {
    //     status: 401,
    //     result: 'No user logged in'
    //   };
    //   next(error);
    // }
  },
  validateLogin: (req, res, next) => {
    let { emailAdress, password } = req.body;
    const schema = Joi.object({
      password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
      emailAdress: Joi.string().email({ minDomainSegments: 2 }).required(),
    });
    const { error } = schema.validate({ emailAdress: emailAdress, password: password });
    if (error) {
      const err = {
        status: 400,
        // Error message wrapped variable in /""\ for some reason
        result: error.message.replace(/"/g, '')
      };
      next(err);
    }

    database.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(`SELECT * FROM user WHERE emailAdress = '${emailAdress}'`, function (error, results, fields) {
        connection.release();
        if (error) throw error;

        if (results.length === 0) {
          const err = {
            status: 401,
            result: 'User not found'
          };
          next(err);
        }
      });

      connection.query(`SELECT * FROM user WHERE emailAdress = '${emailAdress}' AND password = '${password}'`, function (error, results, fields) {
        connection.release();

        if (error) throw error;

        if (results.length > 0) {
          next();
        } else {
          const error = {
            status: 401,
            result: 'Invalid password'
          };
          next(error);
        }
      });
    });
  },
  login: (req, res) => {
    let { emailAdress } = req.body;

    database.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(`SELECT * FROM user WHERE emailAdress = '${emailAdress}'`, function (error, results, fields) {
        connection.release();

        if (error) throw error;

        loggedInUser = results[0];
        res.status(200).json({
          status: 200,
          result: results[0]
        });
      });
    });
  },
  getUserById: (req, res, next) => {
    database.getConnection(function (err, connection) {
      let id = req.params.id;

      if (err) throw err;

      connection.query(`SELECT * FROM user WHERE id = ${id}`, function (error, results, fields) {
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
            result: 'User not found'
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
        result: error.message.replace(/"/g, '')
      };
      next(err);
    }
    next();
  },
  updateUser: (req, res, next) => {
    database.getConnection(function (err, connection) {
      let id = req.params.id;
      let { firstName, lastName, emailAdress, password, phoneNumber, street, city } = req.body;

      if (err) throw err;

      connection.query(
        `UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, phoneNumber = ?, street = ?, city = ? WHERE id = ${id}; 
        SELECT * FROM user;`,
        [firstName, lastName, emailAdress, password, phoneNumber, street, city], function (error, results, fields) {
          connection.release();
          if (error) throw error;

          if (results[0].affectedRows > 0) {
            res.status(200).json({
              status: 200,
              result: results[1]
            });
          } else {
            const error = {
              status: 404,
              result: 'User does not exist'
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

      connection.query(`DELETE FROM user WHERE id = ${id}; SELECT * FROM user;`, function (error, results, fields) {
        if (error) throw error;

        if (results[0].affectedRows > 0) {
          res.status(200).json({
            status: 200,
            result: results[1]
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
}

module.exports = controller;