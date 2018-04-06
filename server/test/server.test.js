const expect = require('expect');
const request = require('supertest');
// const {ObjectID} = require('mongodb');

const {app} = require('./../server');


describe('GET page', () => {
    it('GET / should return home page', (done) => {
        request(app)
            .get('/')
            .expect(200)            
            .end(done);
    })
  
    it('GET /signup should return signup page', (done) => {
        request(app)
            .get('/signup')
            .expect(200)      
            .end(done);
    })   
    
}); 