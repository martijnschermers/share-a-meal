const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
let id = 0; 
let database = []

app.use(express.static('public'))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile('index.html')
  res.sendFile('style.css')
})

app.post('/api/auth/login', (req, res) => {
  let { emailAdress, password } = req.body;

  res.status(201).send(JSON.stringify(user));
  console.log("Logged in with email: " + emailAdress + " and password: " + password);
});

app.post('/api/user', (req, res) => {
  let user = req.body;

  id++;
  user = {
    id,
    ...user, 
  }
  database.push(user);
  res.status(201).send(JSON.stringify(user));

  console.log("Registered user with email: " + user.emailAdress + " and first name: " + user.firstName);
});

app.get('/api/user', (req, res) => {
  res.status(201).send(JSON.stringify(database));
  console.log("Got all users");
});

app.get('/api/user/profile', (req, res) => {
  res.send(JSON.stringify(database[0]));
  console.log("Get personal profile with id " + database[0].id);
});

app.get('/api/user/:id', (req, res) => {
  let id = req.params.id;

  let user = database.filter(user => user.id == id);
  if (user.length > 0) {
    res.status(201).send(JSON.stringify(user[0]));
    console.log("Got user with id " + id);
  } else {
    res.status(404).json({
      status: 404,
      message: 'User not found'
    });
    console.log("User with id " + id + " not found");
  }
});
  
app.put('/api/user/:id', (req, res) => {
  let user = req.body;
  let id = req.params.id;

  res.status(201).send(JSON.stringify(user));
  console.log("Update user with id: " + id);
});

app.delete('/api/user/:id', (req, res) => {
  let id = req.params.id; 
  database.splice(id - 1, 1);
  res.send("Deleted user with id: " + JSON.stringify(id));
  console.log("Deleted user with id: " + id);
});

app.use((req, res, next) => {
  res.status(404).json({  
    status: 404,
    result: 'Not found' 
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})