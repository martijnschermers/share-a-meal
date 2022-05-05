const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/index');
const database = require('../../database/database')

chai.should();
chai.use(chaiHttp);