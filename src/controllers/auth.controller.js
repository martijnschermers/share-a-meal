const Joi = require('joi');
const database = require('../../database/database');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

let controller = {
  validateToken: (req, res, next) => {
    let header = req.headers.authorization;
    if (header) {
      let token = header.substring(7, header.length);

      jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
          const error = {
            status: 401,
            message: 'Invalid token.'
          }
          next(error);
        } else {
          req.userId = payload.userId;
          next();
        }
      });
    } else {
      const error = {
        status: 401,
        message: 'Authorization header missing.'
      }
      next(error);
    }
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
        message: error.message.replace(/"/g, '')
      };
      next(err);
    }
    next();
  },
  login: (req, res, next) => {
    let { emailAdress, password } = req.body;

    database.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query('SELECT * FROM user WHERE emailAdress = ?;', [emailAdress], function (error, results, fields) {
        connection.release();
        if (error) throw error;

        if (results.length > 0) {
          let user = results[0]; 
          if (user.password === password) {
            const payload = {
              userId: user.id,
            }
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, function(err, token) {
              if (err) throw err;
              res.status(200).json({
                status: 200,
                result: { ...user, token },
              });
            });
          } else {
            const error = {
              status: 401,
              message: 'Invalid password.'
            }
            next(error);
          }
        } else {
          const err = {
            status: 401,
            message: 'User not found'
          };
          next(err);
        }
      });
    });
  },
}

module.exports = controller;