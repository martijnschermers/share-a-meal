const express = require('express')
const userRouter = require('./routes/user.routes');
const mealRouter = require('./routes/meal.routes');
const app = express()

require('dotenv').config();
const port = process.env.PORT;

app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).send(
    '<h1>Hello World!</h1><h2>This is the backend server for the Share a Meal Android app.</h2><p>For more info visit the <a href="https://github.com/martijnschermers/share-a-meal">Github repo</a></p>'
  );
})

app.use('/api', userRouter); 
app.use('/api', mealRouter); 

app.use((req, res) => {
  res.status(404).json({
    status: 404,
    result: 'Not found'
  });
});

app.use((err, req, res, next) => {
  res.status(err.status).json(err);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

module.exports = app; 