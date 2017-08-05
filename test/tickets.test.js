var request = require('supertest');
var app = require('../index');

describe("home page", () => {
  it("Home page redirect to tickets", done => {
    request(app).get("/")
      .expect(302, done)
  }); 
})

describe("tickets", () => {
  it("Get all tickets", done => {
    request(app).get("/tickets/")
      .expect(200)
      .expect(/total tickets/,done);
  });
  it("Get one tickets", done => {
    request(app).get("/tickets/1")
      .expect(200)
      .expect(/Requester:/,done);
  }); 
})
