process.env.LOGLEVEL = 'warn'
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/index');
const database = require('../../database/database');
const jwt = require('jsonwebtoken');
require('dotenv').config();
let token = '';

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

const INSERT_USER =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "John", "Doe", "johndoe@gmail.com", "secret", "street", "city"), ' +
  '(2, "Jane", "Doe", "janedoe@gmail.com", "secret", "street", "city");'

const INSERT_MEAL =
  'INSERT INTO `meal` VALUES' +
  '(1,1,0,0,1,"2022-03-22 17:35:00",4,12.75,"https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",1,"2022-02-26 18:12:40.048998","2022-04-26 12:33:51.000000","Pasta Bolognese met tomaat, spekjes en kaas","Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!","gluten,lactose"),' +
  '(2,1,0,0,1,"2022-03-22 17:35:00",4,12.75,"https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",2,"2022-02-26 18:12:40.048998","2022-04-26 12:33:51.000000","Pasta Bolognese met tomaat, spekjes en kaas","Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!","gluten,lactose");'

describe('Manager meals', () => {
  beforeEach((done) => {
    database.getConnection(function (err, connection) {
      if (err) throw err

      connection.query(
        CLEAR_DB + INSERT_USER + INSERT_MEAL,
        function (error, results, fields) {
          connection.release();

          if (error) throw error
          done(); 
        }
      );
    });
  });

  describe('UC-301 | Create meal', () => { 
    it('TC-301-1 | Required field is missing', (done) => {
      token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
      let meal = {
        // Name missing
        description: 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: '2022-04-26 12:33:51.000000',
        imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
        allergenes: ['gluten' ,'lactose'],
        maxAmountOfParticipants: 4,
        price: 12.75
      }
      chai.request(server)
        .post('/api/meal')
        .set('Authorization', `Bearer ${token}`)
        .send(meal)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('name is required');
          done();
        }
      );
    });

    it('TC-301-2 | Not logged in', (done) => {
      let meal = {
        name: 'Spaghetti Bolognese',
        description: 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: '2022-04-26 12:33:51.000000',
        imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
        allergenes: ['gluten' ,'lactose'],
        maxAmountOfParticipants: 4,
        price: 12.75
      }
      chai.request(server)
        .post('/api/meal')
        .send(meal)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(401);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('Authorization header missing.');
          done();
        }
      );
    });

    it('TC-301-3 | Meal successfully created', (done) => {
      let meal = {
        name: 'Spaghetti Bolognese',
        description: 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: '2022-04-26 12:33:51.000000',
        imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
        allergenes: ['gluten' ,'lactose'],
        maxAmountOfParticipants: 4,
        price: 12.75
      }
      chai.request(server)
        .post('/api/meal')
        .set('Authorization', `Bearer ${token}`)
        .send(meal)
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(201);
          res.body.should.be.an('object');
          result.should.be.a('array');
          done();
        }
      );
    });
  });

  describe('UC-302 | Update meal', () => {
    it('TC-302-1 | Required field name is missing', (done) => {
      let meal = {
        // Name is missing
        description: 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: '2022-04-26 12:33:51.000000',
        imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
        allergenes: ['gluten' ,'lactose'],
        maxAmountOfParticipants: 4,
        price: 12.75
      }
      chai.request(server)
        .put('/api/meal/1')
        .set('Authorization', `Bearer ${token}`)
        .send(meal)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('name is required');
          done();
        }
      );
    });

    it('TC-302-2 | Not logged in', (done) => {
      let meal = {
        name: 'Spaghetti Bolognese',
        description: 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: '2022-04-26 12:33:51.000000',
        imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
        allergenes: ['gluten' ,'lactose'],
        maxAmountOfParticipants: 4,
        price: 12.75
      }
      chai.request(server)
        .put('/api/meal/1')
        .send(meal)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(401);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('Authorization header missing.');
          done();
        }
      );
    });

    it('TC-302-3 | Not the owner of the data', (done) => {
      let meal = {
        name: 'Spaghetti Bolognese',
        description: 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: '2022-04-26 12:33:51.000000',
        imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
        allergenes: ['gluten' ,'lactose'],
        maxAmountOfParticipants: 4,
        price: 12.75
      }
      chai.request(server)
        .put('/api/meal/2')
        .set('Authorization', `Bearer ${token}`)
        .send(meal)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(403);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('Logged in user is not the owner of this meal.');
          done();
        }
      );
    });

    it('TC-302-4 | Meal does not exist', (done) => {
      let meal = {
        name: 'Spaghetti Bolognese',
        description: 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: '2022-04-26 12:33:51.000000',
        imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
        allergenes: ['gluten' ,'lactose'],
        maxAmountOfParticipants: 4,
        price: 12.75
      }
      chai.request(server)
        .put('/api/meal/0')
        .set('Authorization', `Bearer ${token}`)
        .send(meal)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(404);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('Meal does not exist');
          done();
        }
      );
    });

    it('TC-302-5 | Meal successfully updated', (done) => {
      let meal = {
        name: 'Spaghetti Bolognese',
        description: 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
        isActive: true,
        isVega: true,
        isVegan: true,
        isToTakeHome: true,
        dateTime: '2022-04-26 12:33:51.000000',
        imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
        allergenes: ['gluten' ,'lactose'],
        maxAmountOfParticipants: 4,
        price: 12.75
      }
      chai.request(server)
        .put('/api/meal/1')
        .set('Authorization', `Bearer ${token}`)
        .send(meal)
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(200);
          res.body.should.be.an('object');
          result.should.have.property('name');
          result.should.have.property('description');
          result.should.have.property('isActive');
          result.should.have.property('isVega');
          result.should.have.property('isVegan');
          result.should.have.property('isToTakeHome');
          result.should.have.property('dateTime');
          result.should.have.property('imageUrl');
          result.should.have.property('allergenes');
          result.should.have.property('maxAmountOfParticipants');
          result.should.have.property('price');
          done();
        }
      );
    });
  });

  describe('UC-303 | Retrieve list of meals', () => {
    it('TC-303-1 | List of meals returned', (done) => {
      chai.request(server)
        .get('/api/meal')
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(200);
          res.body.should.be.an('object');
          result.should.be.an('array');
          done();
        }
      );
    });
  });

  describe('UC-304 | Retrieve details of a meal', () => {
    it('TC-304-1 | Meal does not exist', (done) => {
      chai.request(server)
        .get('/api/meal/0')
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(404);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('Meal not found');
          done();
        }
      );
    });

    it('TC-304-2 | Returned details of meal', (done) => {
      chai.request(server)
        .get('/api/meal/1')
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(200);
          res.body.should.be.an('object');
          result.should.have.property('name');
          result.should.have.property('description');
          result.should.have.property('isActive');
          result.should.have.property('isVega');
          result.should.have.property('isVegan');
          result.should.have.property('isToTakeHome');
          result.should.have.property('dateTime');
          result.should.have.property('imageUrl');
          result.should.have.property('allergenes');
          result.should.have.property('maxAmountOfParticipants');
          result.should.have.property('price');
          done();
        }
      );
    });
  });

  describe('UC-305 | Delete a meal', () => {
    it('TC-305-2 | Not logged in', (done) => {
      chai.request(server)
        .delete('/api/meal/1')
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(401);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('Authorization header missing.');
          done();
        }
      );
    });

    it('TC-305-3 | Logged in user is not the owner of the meal', (done) => {
      chai.request(server)
        .delete('/api/meal/2')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('Not allowed to edit');
          done();
        }
      );
    });

    it('TC-305-4 | Meal does not exist', (done) => {
      chai.request(server)
        .delete('/api/meal/0')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(404);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('Meal does not exist');
          done();
        }
      );
    });

    it('TC-305-5 | Meal successfully deleted', (done) => {
      chai.request(server)
        .delete('/api/meal/1')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(200);
          res.body.should.be.an('object');
          result.should.be.a('array');
          done();
        }
      );
    });
  });
});