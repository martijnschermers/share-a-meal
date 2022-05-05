const Joi = require('joi');
const database = require('../../database/database');

// Placeholder for the time being, login functionality will be added later
let loggedInUser = {
  id: 1, 
  firstName: "John",
  lastName: "Beton",
  street: "Lovensdijkstraat 61",
  city: "Breda",
  password: "secret",
  emailAdress: "johndoe@gmail.com"
}

let controller = {
  validateMeal: (req, res, next) => {
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
        result: result.error.message.replace(/"/g, '')
      };
      next(error);
    }
    next();
  },
  addMeal: (req, res, next) => {
    database.getConnection(function (err, connection) {
      let meal = req.body;
      meal.allergenes = meal.allergenes.toString();

      if (loggedInUser) {
        meal.cookId = loggedInUser.id;
      }

      if (err) throw err;

      // Multiple queries in one function is made possible due to the multipleStatements option in database.js 
      connection.query('INSERT INTO meal SET ?; SELECT * FROM meal;', meal, function (error, results, fields) {
        connection.release();
        if (error) throw error;

        res.status(201).json({
          status: 201,
          result: results[1]
        });
      });
    });
  },
  getAllMeals: (req, res) => {
    database.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query('SELECT * FROM meal', function (error, results, fields) {
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
    database.getConnection(function (err, connection) {
      let id = req.params.id;

      if (err) throw err;

      connection.query(`SELECT * FROM meal WHERE id = ${id}`, function (error, results, fields) {
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
            result: 'Meal not found'
          };
          next(error);
        }
      });
    });
  },
  updateMeal: (req, res, next) => {
    database.getConnection(function (err, connection) {
      let id = req.params.id;
      let { name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price } = req.body;
      let convertedAllergenes = allergenes.toString();

      if (err) throw err;

      connection.query(
        `UPDATE meal SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, imageUrl = ?, allergenes = ?, maxAmountOfParticipants = ?, price = ? WHERE id = ${id}; 
        SELECT * FROM meal;`,
        [name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, convertedAllergenes, maxAmountOfParticipants, price], function (error, results, fields) {
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
              result: 'Meal does not exist'
            };
            next(error);
          }
        });
    });
  },
  deleteMeal: (req, res, next) => {
    database.getConnection(function (err, connection) {
      let id = req.params.id;

      if (err) throw err;

      connection.query(`DELETE FROM meal WHERE id = ${id}; SELECT * FROM meal;`, function (error, results, fields) {
        if (error) throw error;

        if (results[0].affectedRows > 0) {
          res.status(200).json({
            status: 200,
            result: results[1]
          });
        } else {
          const error = {
            status: 404,
            result: 'Meal not found'
          };
          next(error);
        }
      });
    });
  },
  participate: (req, res, next) => {
    database.getConnection(function (err, connection) {
      let id = req.params.id;

      if (err) throw err;

      connection.query(`SELECT * FROM meal WHERE id = ${id}; SELECT * FROM meal_participants_user WHERE mealId = ${id}`, function (error, results, fields) {
        if (error) throw error;

        if (results[0].length > 0) {
          if (loggedInUser) {
            if (results[1][0].userId == loggedInUser.id) {
              connection.query(`DELETE FROM meal_participants_user WHERE userId = ${loggedInUser.id} AND mealId = ${id};`, function (error, results, fields) {
                if (error) throw error;
              });
            } else {
              if (results[1].length < results[0][0].maxAmountOfParticipants) {
                connection.query('INSERT INTO meal_participants_user SET ?; SELECT * FROM meal_participants_user;', { mealId: id, userId: loggedInUser.id }, function (error, results, fields) {
                  connection.release();
                  if (error) throw error;
                });
              } else {
                const error = {
                  status: 400,
                  result: 'Meal is full'
                };
                next(error);
              }
            }

            res.status(200).json({
              status: 200,
              result: {
                currentlyParticipating: true,
                currentAmountOfParticipants: results[1].length,
              }
            });
          } else {
            const error = {
              status: 401,
              result: 'You need to be logged in to participate'
            }
            next(error);
          }
        } else {
          const error = {
            status: 404,
            result: 'Meal not found'
          };
          next(error);
        }
      });
    });
  }
}

module.exports = controller;