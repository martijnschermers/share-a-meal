const express = require('express')
const userRouter = require('./routes/user.routes');
const app = express()

require('dotenv').config();
const port = process.env.PORT;

app.use(express.static('public'))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile('index.html')
  res.sendFile('style.css')
})

app.use('/api', userRouter); 

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