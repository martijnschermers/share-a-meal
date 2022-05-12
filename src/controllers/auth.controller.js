const Joi = require('joi');
const database = require('../../database/database');

let loggedInUser = null;

let controller = {
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
}

module.exports = controller;