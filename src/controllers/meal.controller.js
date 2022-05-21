const Joi = require('joi');
const database = require('../../database/database');
const logger = require('../config/config');

let controller = {
  validateMeal: (req, res, next) => {
    logger.info('Validating meal');

    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      isActive: Joi.boolean().required(),
      isVega: Joi.boolean().required(),
      isVegan: Joi.boolean().required(),
      isToTakeHome: Joi.boolean().required(),
      dateTime: Joi.string().required(),
      imageUrl: Joi.string().required(),
      allergenes: Joi.array().required(),
      maxAmountOfParticipants: Joi.number().required(),
      price: Joi.number().required(),
    });
    const result = schema.validate(req.body);
    if (result.error) {
      const error = {
        status: 400,
        // Error message wrapped variable in /" "\ for some reason
        message: result.error.message.replace(/"/g, '')
      };
      next(error);
    }
    next();
  },
  addMeal: (req, res, next) => {
    let meal = req.body;
    let userId = req.userId;
    meal.allergenes = meal.allergenes.toString();
    meal.cookId = userId;
    logger.info('Adding meal: ', meal);

    database.getConnection(function (err, connection) {
      if (err) throw err;

      
      // Multiple queries in one function is made possible due to the multipleStatements option in database.js 
      connection.query('INSERT INTO meal SET ?; SELECT * FROM meal;', meal, function (error, results, fields) {
        connection.release();
        if (error) throw error;

        connection.query('INSERT INTO meal_participants_user SET ?;', { mealId: results[0].insertId, userId: userId }, function (error, results, fields) {
          if (error) throw error;
        });

        res.status(201).json({
          status: 201,
          result: results[1]
        });
      });
    });
  },
  getAllMeals: (req, res) => {
    logger.info('Getting all meals');

    database.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query('SELECT * FROM meal;', function (error, results, fields) {
        connection.release();
        if (error) throw error;

        res.status(200).json({
          status: 200,
          result: results
        });
      });
    });
  },
  getMealById: (req, res, next) => {
    let id = req.params.id;
    logger.info('Getting meal by id: ', id);

    database.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query('SELECT * FROM meal WHERE id = ?;', [id], function (error, results, fields) {
        connection.release();
        if (error) throw error;

        if (results.length > 0) {
          res.status(200).json({
            status: 200,
            result: results[0]
          });
        } else {
          const error = {
            status: 404,
            message: 'Meal not found'
          };
          next(error);
        }
      });
    });
  },
  updateMeal: (req, res, next) => {
    let id = req.params.id;
    let { name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price } = req.body;
    let convertedAllergenes = allergenes.toString();
    let userId = req.userId;
    logger.info('Updating meal with id: ', id);

    database.getConnection(function (err, connection) {
      if (err) throw err;

      if (userId) {
        connection.query('SELECT * FROM meal WHERE id = ?;', [id], function (error, results, fields) {
          if (error) throw error;

          if (results.length > 0) {
            connection.query(
              `UPDATE meal SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, imageUrl = ?, allergenes = ?, maxAmountOfParticipants = ?, price = ? WHERE id = ? AND cookId = ?;
              SELECT * FROM meal WHERE id = ?;`,
              [name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, convertedAllergenes, maxAmountOfParticipants, price, id, userId, id], function (error, results, fields) {
                connection.release();
                if (error) throw error;

                if (results[0].affectedRows > 0) {
                  res.status(200).json({
                    status: 200,
                    result: results[1][0]
                  });
                } else {
                  const error = {
                    status: 403,
                    message: 'Logged in user is not the owner of this meal.'
                  };
                  next(error);
                }
              }
            );
          } else {
            const error = {
              status: 404,
              message: 'Meal not found'
            };
            next(error);
          }
        });
      }
    });
  },
  deleteMeal: (req, res, next) => {
    let id = req.params.id;
    let userId = req.userId;
    logger.info('Deleting meal with id: ', id);

    database.getConnection(function (err, connection) {
      if (err) throw err;

      if (userId) {
        connection.query('SELECT * FROM meal WHERE id = ?;', [id], function (error, results, fields) {
          if (error) throw error;

          if (results.length > 0) {
            connection.query(`DELETE FROM meal WHERE id = ? AND cookId = ?; SELECT * FROM meal;`, [id, userId], function (error, results, fields) {
              if (error) throw error;

              if (results[0].affectedRows > 0) {
                res.status(200).json({
                  status: 200,
                  result: results[1]
                });
              } else {
                const error = {
                  status: 400,
                  message: 'Not allowed to edit'
                };
                next(error);
              }
            });
          } else {
            const error = {
              status: 404,
              message: 'Meal not found'
            };
            next(error);
          }
        });
      }
    });
  },
  participate: (req, res, next) => {
    let id = req.params.id;
    let userId = req.userId;
    let isParticipating = true; 
    logger.info('Participating in meal with id: ', id);

    database.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query('SELECT * FROM meal WHERE id = ?;', [id], function (error, results, fields) {
        if (error) throw error;

        if (results.length > 0) {
          connection.query('SELECT * FROM meal_participants_user WHERE mealId = ?;', [id], function (error, results, fields) {
            if (error) throw error;
            
            if (results[0].userId == userId) {
              connection.query('DELETE FROM meal_participants_user WHERE userId = ? AND mealId = ?;', [userId, id], function (error, results, fields) {
                if (error) throw error;
                isParticipating = true; 
              });
            } else {
              if (results[1].length < results[0][0].maxAmountOfParticipants) {
                connection.query('INSERT INTO meal_participants_user SET ?;', { mealId: id, userId: userId }, function (error, results, fields) {
                  connection.release();
                  if (error) throw error;
                });
              } else {
                const error = {
                  status: 400,
                  message: 'Meal is full'
                };
                next(error);
              }
            }

            res.status(200).json({
              status: 200,
              result: {
                currentlyParticipating: isParticipating,
                currentAmountOfParticipants: results[1].length,
              }
            });
          });
        } else {
          const error = {
            status: 404,
            message: 'Meal not found'
          };
          next(error);
        }
      });
    });
  }
}

module.exports = controller;