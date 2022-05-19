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

bcrypt.hash('Secret123', 10, function(err, hash) {
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

  describe('UC-101 | Login', () => { 
    it('TC-101-1 | Required field is missing', (done) => {
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

    it('TC-101-2 | Invalid emailadress', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .send({
          emailAdress: 'john@gmail',
          password: 'Secret123'
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

    it('TC-101-3 | Invalid password', (done) => {
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

    it('TC-101-4 | User does not exist', (done) => {
      let user = {
        emailAdress: 'john@hotmail.com',
        password: 'Secret123'
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

    it('TC-101-5 | User successfully logged in', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .send({
          emailAdress: 'johndoe@gmail.com',
          password: 'Secret123'
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

  describe('UC-201 | Register as a new user', () => {
    it('TC-201-1 | Required field is missing', (done) => {
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

    it('TC-201-2 | Invalid emailadress', (done) => {
      let user = {
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "Secret123",
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

    it('TC-201-3 | Invalid password', (done) => {
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
          message.should.be.a('string').eql('password with value se fails to match the required pattern: /^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$/');
          done();
        }
      );
    });

    it('TC-201-4 | User already exists', (done) => {
      let user = {
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "Secret123",
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

    it('TC-201-5 | User successfully registered', (done) => {
      let user = {
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "Secret123",
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

  describe('UC-202 | Overview of users', () => {
    it('TC-202-1 | Show 1 user', (done) => {
      chai.request(server)
        .get('/api/user')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.be.a('object');
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.be.an('array');
          result.length.should.be.eql(1);
          done();
        }
      );
    });
  });

  describe('UC-203 | Request personal profile', () => {
    it('TC-203-1 | Invalid token', (done) => {
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

    it('TC-203-2 | Valid token and user exists', (done) => {
      chai.request(server)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.be.a('object');
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
          done();
        }
      );
    });
  });

  describe('UC-204 | Details of user', () => {
    it('TC-204-1 | Invalid token', (done) => {
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

    it('TC-204-2 | User ID does not exist', (done) => {
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

    it('TC-204-3 | User ID exists', (done) => {
      chai.request(server)
        .get('/api/user/1')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.be.a('object');
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.have.property('id');
          result.should.have.property('firstName');
          result.should.have.property('lastName');
          result.should.have.property('isActive');
          result.should.have.property('emailAdress');
          result.should.have.property('phoneNumber');
          result.should.have.property('roles');
          result.should.have.property('street');
          result.should.have.property('city');
          done();
        }
      );
    });
  });

  describe('UC-205 | Update user', () => {
    it('TC-205-1 | Required field emailadress is missing', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        // Email is missing
        password: "Secret123",
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

    it('TC-205-3 | Invalid phone number', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "johndoe@gmail.com",
        password: "Secret123",
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
    
    it('TC-205-4 | User does not exist', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "johndoe@gmail.com",
        password: "Secret123",
        phoneNumber: "0612425475"
      }
      chai.request(server)
        .put('/api/user/0')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          let { status, message } = res.body;
          status.should.eql(400);
          message.should.be.a('string').eql('User not found');
          done();
        }
      );
    });

    it('TC-205-5 | Not logged in', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "johndoe@gmail.com",
        password: "Secret123",
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

    it('TC-205-6 | User successfully updated', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Beton",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "johnbeton@gmail.com",
        password: "Secret123",
        phoneNumber: "0612425475"
      }
      chai.request(server)
        .put('/api/user/1')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.have.property('id');
          result.should.have.property('firstName');
          result.should.have.property('lastName');
          result.should.have.property('isActive');
          result.should.have.property('emailAdress');
          result.should.have.property('phoneNumber');
          result.should.have.property('roles');
          result.should.have.property('street');
          result.should.have.property('city');
          done();
        }
      );
    });
  });

  describe('UC-206 | Delete user', () => {
    it('TC-206-1 | User does not exist', (done) => {
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

    it('TC-206-2 | Not logged in', (done) => {
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

    it('TC-206-3 | User successfully deleted', (done) => {
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