process.env.LOGLEVEL = 'warn'
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/index');
const database = require('../../database/database');
const bcrypt = require('bcrypt');
let token = '';

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE
let INSERT_USER = '';

bcrypt.hash('secret', 10, function(err, hash) {
  INSERT_USER =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "John", "Doe", "johndoe@gmail.com", "' + hash + '", "street", "city");'
});

describe('Manager users', () => {
  beforeEach((done) => {
    database.getConnection(function (err, connection) {
      if (err) throw err

      connection.query(
        CLEAR_DB + INSERT_USER,
        function (error, results, fields) {
          connection.release()

          if (error) throw error
          done()
        }
      );
    });
  });

  describe('UC-101 Login', () => { 
    it('TC-101-1 | it should not login a user without a emailAdress', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .send({
          // Emailaddress is missing
          password: '12345678'
        })
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('emailAdress is required');
          done();
        }
      );
    });

    it('TC-101-2 | it should not login a user with a invalid emailAdress', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .send({
          emailAdress: 'john@gmail',
          password: 'secret'
        })
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('emailAdress must be a valid email');
          done();
        }
      );
    });

    it('TC-101-3 | it should not login a user with a invalid password', (done) => {
      let user = {
        emailAdress: 'john@gmail',
        password: 'se'
      }
      chai.request(server)
        .post('/api/auth/login')
        .send(user)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          res.body.should.be.an('object');
          message.should.be.a('string').eql(`password with value ${user.password} fails to match the required pattern: /^[a-zA-Z0-9]{3,30}$/`);
          done();
        }
      );
    });

    it('TC-101-4 | it should not login a user that does not exist', (done) => {
      let user = {
        emailAdress: 'john@hotmail.com',
        password: 'secret'
      }
      chai.request(server)
        .post('/api/auth/login')
        .send(user)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(401);
          res.body.should.be.an('object');
          message.should.be.a('string').eql('User not found');
          done();
        }
      );
    });

    it('TC-101-5 | it should return a user with a valid email and password', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .send({
          emailAdress: 'johndoe@gmail.com',
          password: 'secret'
        })
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.be.a('object');
          result.should.have.property('id');
          result.should.have.property('firstName');
          result.should.have.property('lastName');
          result.should.have.property('isActive');
          result.should.have.property('emailAdress');
          result.should.have.property('phoneNumber');
          result.should.have.property('roles');
          result.should.have.property('street');
          result.should.have.property('city');
          result.should.have.property('token');
          token = result.token;
          done();
        }
      );
    });
  });

  describe('UC-201 /POST user', () => {
    it('TC-201-1 | it should not POST a user without email or password field', (done) => {
      // User misses emailAdress and password field for testing 
      let user = {
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat 61",
        city: "Breda",
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(400);
          message.should.be.a('string').eql("password is required");
          done();
        }
      );
    });

    it('TC-201-2 | it should not POST a user with a invalid email', (done) => {
      let user = {
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "secret",
        emailAdress: "invalidEmail"
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(400);
          message.should.be.a('string').eql("emailAdress must be a valid email");
          done();
        }
      );
    });

    it('TC-201-3 | it should not POST a user with a invalid password', (done) => {
      let user = {
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "se",
        emailAdress: "john.doe@gmail.com"
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(400);
          message.should.be.a('string').eql(`password with value ${user.password} fails to match the required pattern: /^[a-zA-Z0-9]{3,30}$/`);
          done();
        }
      );
    });

    it('TC-201-4 | it should not POST a user with an email that already exists', (done) => {
      let user = {
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "secret",
        emailAdress: "johndoe@gmail.com"
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(409);
          message.should.be.a('string').eql('Emailaddress is already taken');
          done();
        }
      );
    });

    it('TC-201-5 | it should POST a user with valid parameters', (done) => {
      let user = {
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "secret",
        emailAdress: "johnbeton@gmail.com"
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.a('object');
          let { status, result } = res.body;
          status.should.eql(201);
          result.should.be.a('array');
          done();
        }
      );
    });
  });

  describe('UC-202 /GET users', () => {
    it('TC-202-1 | it should GET all the users', (done) => {
      chai.request(server)
        .get('/api/user')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.be.a('object');
          let { status, result } = res.body;
          status.should.eql(200);
          result.length.should.be.eql(1);
          done();
        }
      );
    });
  });

  describe('UC-203 /GET personal profile', () => {
    it('TC-203-1 | it should not get a user, because of a invalid token', (done) => {
      chai.request(server)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalidToken')
        .end((err, res) => {
          res.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(401);
          message.should.be.a('string').eql('Invalid token.');
          done();
        }
      );
    });

    it('TC-203-2 | it should get a user, because of a valid token and an existing user', (done) => {
      chai.request(server)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.be.a('object');
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.be.a('object');
          done();
        }
      );
    });
  });

  describe('UC-204 /GET user details', () => {
    it('TC-204-1 | it should not get a user, because of a invalid token', (done) => {
      chai.request(server)
        .get('/api/user/1')
        .set('Authorization', 'Bearer invalidToken')
        .end((err, res) => {
          res.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(401);
          message.should.be.a('string').eql('Invalid token.');
          done();
        }
      );
    });

    it('TC-204-2 | it should not get a user, because of a invalid user id', (done) => {
      chai.request(server)
        .get('/api/user/0')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.be.a('object');
          let { status, message } = res.body;
          status.should.eql(404);
          message.should.be.a('string').eql('User not found');
          done();
        }
      );
    });

    it('TC-204-3 | it should get a user, because an existing user', (done) => {
      chai.request(server)
        .get('/api/user/1')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.be.a('object');
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.be.a('array');
          done();
        }
      );
    });
  });

  describe('UC-205 /PUT user', () => {
    it('TC-205-1 | it should not update a user with a missing required field', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        // Email is missing
        password: "secret",
        phoneNumber: "0612425475"
      }
      chai.request(server)
        .put('/api/user/1')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          message.should.be.a('string').eql('email is required');
          done();
        }
      );
    });

    it('TC-205-2 | it should not update a user with a invalid email', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "johndoe@gmail",
        password: "secret",
        phoneNumber: "0612425475"
      }
      chai.request(server)
        .put('/api/user/1')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          message.should.be.a('string').eql('email must be a valid email');
          done();
        }
      );
    });

    it('TC-205-3 | it should not update a user with a invalid phone number', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "johndoe@gmail.com",
        password: "secret",
        phoneNumber: "invalidPhoneNumber"
      }
      chai.request(server)
        .put('/api/user/1')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          message.should.be.a('string').eql('phoneNumber length must be 10 characters long');
          done();
        }
      );
    });
    
    it('TC-205-4 | it should not update a user that does not exist', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "johndoe@gmail.com",
        password: "secret",
        phoneNumber: "0612425475"
      }
      chai.request(server)
        .put('/api/user/0')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          message.should.be.a('string').eql('User does not exist');
          done();
        }
      );
    });

    it('TC-205-5 | it should not update a user when there is no logged in user', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "johndoe@gmail.com",
        password: "secret",
        phoneNumber: "0612425475"
      }
      chai.request(server)
        .put('/api/user/1')
        .send(user)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(401);
          message.should.be.a('string').eql('Authorization header missing.');
          done();
        }
      );
    });

    it('TC-205-6 | it should update a user', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "johnbeton@gmail.com",
        password: "secret",
        phoneNumber: "0612425475"
      }
      chai.request(server)
        .put('/api/user/1')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.be.a('array');
          done();
        }
      );
    });
  });

  describe('UC-206 /DELETE user', () => {
    it('TC-206-1 | it should not delete a user that does not exist', (done) => {
      chai.request(server)
        .delete('/api/user/0')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          message.should.be.a('string').eql('User not found');
          done();
        }
      );
    });

    it('TC-206-2 | it should not delete a user when there is no logged in user', (done) => {
      chai.request(server)
        .delete('/api/user/1')
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(401);
          message.should.be.a('string').eql('Authorization header missing.');
          done();
        }
      );
    });

    it('TC-206-3 | it should delete a user', (done) => {
      chai.request(server)
        .delete('/api/user/1')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.be.a('array');
          done();
        }
      );
    });
  });
});