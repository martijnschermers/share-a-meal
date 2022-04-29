const chai = require('chai'); 
const chaiHttp = require('chai-http');
const server = require('../../src/index');
const Database = require('../../src/database');
let database = new Database();

chai.should();
chai.use(chaiHttp);

describe('Manager users', () => {
  beforeEach((done) => {
    database.clearDatabase();
    done();
  });

  describe('TC-101-1 /POST login', () => {
    it('should return a error message', (done) => {
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
          result.should.be.a('string').eql('emailAdress must be a string');
        });          
      done();
    });
  });

  describe.skip('TC-101-5 /POST login', () => {
    it('should return a user with a valid email and password', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .send({
          emailAdress: 'johndoe@gmail.com',
          password: '12345678'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('firstName');
          res.body.should.have.property('lastName');
          res.body.should.have.property('emailAdress');
          res.body.should.have.property('password');
          res.body.should.have.property('role');
          res.body.should.have.property('token');
          res.body.should.have.property('tokenExpiration');
          res.body.should.have.property('createdAt');
          res.body.should.have.property('updatedAt');
          res.body.should.have.property('deletedAt');
          res.body.should.have.property('id').eql(1);
          res.body.should.have.property('firstName').eql('John');
          res.body.should.have.property('lastName').eql('Doe');
        });          
      done();
    });
  });

  describe.skip('TC-202-1 /GET users', () => {
    it('it should GET all the users', (done) => {
      chai.request(server)
        .get('/api/user')
        .end((err, res) => {
          res.should.be.a('object');
          let { status, result } = res.body;
          status.should.eql(200);
          result.length.should.be.eql(0);
          done();
        });
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
          result.should.be.a('string').eql("\"password\" is required");
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
          result.should.be.a('string').eql("\"email\" must be a valid email");
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
          result.should.be.a('string').eql(`\"password\" with value \"${user.password}\" fails to match the required pattern: /^[a-zA-Z0-9]{3,30}$/`);
          done();
        }
      );
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
        .put('/api/user/1')
        .send(user)
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(400);
          result.should.be.a('string').eql('User not found');
          done();
        }
      );
    });
  });
});