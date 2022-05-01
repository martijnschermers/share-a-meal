const chai = require('chai'); 
const chaiHttp = require('chai-http');
const server = require('../../src/index');

chai.should();
chai.use(chaiHttp);

describe('Manager users', () => {
  beforeEach((done) => {
    //TODO: Clear the database before each test
    done();
  });

  describe('TC-101-1 /POST login', () => {
    it('should not login a user without a emailAdress', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .send({
          // Emailaddress is missing
          password: '12345678'
        })
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(400);
          res.body.should.be.an('object');
          result.should.be.a('string').eql('email is required');
        });          
      done();
    });
  });

  describe('TC-101-2 /POST login', () => {
    it('should not login a user with a invalid emailAdress', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .send({
          emailAdress: 'john@gmail',
          password: 'secret'
        })
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(400);
          res.body.should.be.an('object');
          result.should.be.a('string').eql('email must be a valid email');
        });          
      done();
    });
  });

  describe('TC-101-3 /POST login', () => {
    it('should not login a user with a invalid password', (done) => {
      let user = {
        emailAdress: 'john@gmail',
        password: 'se'
      }
      chai.request(server)
        .post('/api/auth/login')
        .send(user)
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(400);
          res.body.should.be.an('object');
          result.should.be.a('string').eql(`password with value ${user.password} fails to match the required pattern: /^[a-zA-Z0-9]{3,30}$/`);
        });          
      done();
    });
  });

  describe('TC-101-4 /POST login', () => {
    it('should not login a user that does not exist', (done) => {
      let user = {
        emailAdress: 'john@hotmail.com',
        password: 'secret'
      }
      chai.request(server)
        .post('/api/auth/login')
        .send(user)
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(400);
          res.body.should.be.an('object');
          result.should.be.a('string').eql(`Wrong email or password`);
        });          
      done();
    });
  });

  describe('TC-101-5 /POST login', () => {
    it('should return a user with a valid email and password', (done) => {
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
          result.should.have.property('password');
          result.should.have.property('phoneNumber');
          result.should.have.property('roles');
          result.should.have.property('street');
          result.should.have.property('city');
        });          
      done();
    });
  });

  describe('TC-201-1 /POST user', () => {
    it('it should not POST a user without email or password field', (done) => {
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
          let { status, result } = res.body;
          status.should.eql(400);
          result.should.be.a('string').eql("password is required");
          done();
        }
      );
    });
  });

  describe('TC-201-2 /POST user', () => {
    it('it should not POST a user with a invalid email', (done) => {
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
          let { status, result } = res.body;
          status.should.eql(400);
          result.should.be.a('string').eql("email must be a valid email");
          done();
        }
      );
    });
  });

  describe('TC-201-3 /POST user', () => {
    it('it should not POST a user with a invalid password', (done) => {
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
          let { status, result } = res.body;
          status.should.eql(400);
          result.should.be.a('string').eql(`password with value ${user.password} fails to match the required pattern: /^[a-zA-Z0-9]{3,30}$/`);
          done();
        }
      );
    });
  });

  describe('TC-201-4 /POST user', () => {
    it('it should not POST a user with an email that already exists', (done) => {
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
          let { status, result } = res.body;
          status.should.eql(401);
          result.should.be.a('string').eql('Emailaddress is already taken');
          done();
        }
      );
    });
  });

  describe('TC-201-5 /POST user', () => {
    it('it should POST a user with valid parameters', (done) => {
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
          status.should.eql(200);
          result.should.be.a('array');
          done();
        }
      );
    });
  });

  describe('TC-202-1 /GET users', () => {
    it('it should GET all the users', (done) => {
      chai.request(server)
        .get('/api/user')
        .end((err, res) => {
          res.should.be.a('object');
          let { status, result } = res.body;
          status.should.eql(200);
          result.length.should.be.eql(6);
          done();
        });
    });
  });

  describe('TC-205-4 /PUT user', () => {
    it('it should update a user', (done) => {
      let user = {
        id: 1, 
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "johndoe@gmail.com",
        password: "secret"
      }
      chai.request(server)
        .put('/api/user/0')
        .send(user)
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(404);
          result.should.be.a('string').eql('Update failed');
          done();
        }
      );
    });
  });
});