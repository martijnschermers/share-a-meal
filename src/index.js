const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const userRouter = require('./routes/user.routes');

app.use(express.static('public'))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile('index.html')
  res.sendFile('style.css')
})

app.use(userRouter); 

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