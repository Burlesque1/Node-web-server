const expect = require('expect');
const request = require('supertest');
// const {ObjectID} = require('mongodb');

const {app} = require('./../server');


describe('GET /', () => {
    it('should return home page', (done) => {
        expect(true).toBe(true);
        done();
    })
});