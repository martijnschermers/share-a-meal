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

  describe('/GET user', () => {
    it('it should GET all the users', (done) => {
      chai.request(server)
        .get('/api/user')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });

  describe('/POST user', () => {
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
          result.should.be.a('string').eql('emailAdress must be a string');
          done();
        }
      );
    });
  });

  // Create a test case for updating a user 
  describe('/PUT user', () => {
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
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('emailAdress');
          res.body.should.have.property('password');
          res.body.should.have.property('firstName');
          res.body.should.have.property('lastName');
          res.body.should.have.property('id').eql(res.body.id);
          res.body.firstName.should.eql('John');
          res.body.lastName.should.eql('Doe');
          res.body.emailAdress.should.eql('johndoe@gmail.com');
          res.body.password.should.eql('secret');
          done();
        }
      );
    });
  });
});