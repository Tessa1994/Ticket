'use strict';

let request = require('request-promise');
let express = require('express');
let app = express();

const baseUrl = 'https://cathy1994.zendesk.com/';
const username = 'xuan199408@gmail.com';
const password = '';

const pageLength = 25;

// set template engine
app.set('view engine', 'pug');

// redirect to tickets page
app.get('/', (req, res) => {
  res.redirect('/tickets');
});

// All tickets
app.get('/tickets', (req, res) => {
  let page = Number(req.query.page) ? req.query.page : 1;
  request(generateRequestOptions(baseUrl + '/api/v2/tickets.json', 'GET'))
    .then( body => {
      let tickets = JSON.parse(body).tickets;
      let count = tickets.length;
      let numPages = Math.ceil(tickets.length/pageLength);
      tickets = tickets.slice((page-1)*pageLength, page*pageLength);
      res.render('index', {
        tickets: tickets,
        count: count,
        pageLength: pageLength,
        numPages: numPages,
        page: page
      });
    })
    .catch( err => {
      handleError(res, err);
    });
});

// get one ticket
app.get('/tickets/:ticketId', (req, res) => {
  request(generateRequestOptions(baseUrl + `/api/v2/tickets/${req.params.ticketId}.json`, 'GET'))
    .then( body => {
      let ticket = JSON.parse(body).ticket;
      return request(generateRequestOptions(baseUrl + `/api/v2/users/${ticket.requester_id}.json`, 'GET')).then(body => [ticket, body]);
    })
    .then( ([ticket, body]) => {
      let user = JSON.parse(body).user;
      res.render('show', {
        ticket: ticket,
        user: user,
        page: req.query.page
      });
    })
    .catch( (err) => {
      handleError(res, err);
    });
});


let generateRequestOptions = (uri, httpMethod) => {
  return {
    uri: uri,
    method: httpMethod,
    auth: {
      'user': username,
      'pass': password
    }
  }
};

// error handling
let handleError = (res, err) => {
  let error;
  // api call error
  if(err.statusCode){
    error = JSON.parse(err.error).error;
    // internal error
  }else{
    error = err.message
  }
  res.render('error', {
    statusCode: err.statusCode,
    error: error
  });
};

app.listen(3000, () => console.log('Zendesk app listening on port 3000'));

module.exports = app;
