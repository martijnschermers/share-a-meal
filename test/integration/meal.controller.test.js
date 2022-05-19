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
          connection.release()

          if (error) throw error
          done(); 
        }
      );
    });
  });

  describe('UC-301 /POST meal', () => { 
    it('TC-301-1 | it should not POST a meal with missing required fields', (done) => {
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
        });
      done();
    });

    it('TC-301-2 | it should not POST a meal when there is no logged in user', (done) => {
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
        });
      done();
    });

    it('TC-301-3 | it should POST a meal', (done) => {
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
        });
      done();
    });
  });

  describe('UC-302 /PUT meal', () => {
    it('TC-302-1 | it should not update a meal with missing required fields', (done) => {
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
        }
      );
      done();
    });

    it('TC-302-2 | it should not update a meal when there is no user logged in', (done) => {
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
        }
      );
      done();
    });

    it('TC-302-3 | it should not update a meal when the logged in user is not the owner of the meal', (done) => {
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
        }
      );
      done();
    });
  });
});