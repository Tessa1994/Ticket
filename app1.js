'use strict';
let express = require('express');
let app = express();
let request = require('request-promise');
let yamljs = require('yamljs');
let zendesk = require('./api/zendesk');

// set template engine
app.set('view engine', 'pug');


// redirect to tickets page
app.get('/', (req, res) => {
  res.redirect('/tickets');
});


// get all tickets
app.get('/tickets', (req, res) => {
    zendesk.tickets(req.query.page ? req.query.page : 1)
        .then(obj => {
            res.render('index', obj);
        }).catch(err => {
           handleError(res, err);
        });
});

// get one ticket
app.get('/tickets/:id', (req, res) => {
    zendesk.ticket(req.params.id, req.query.page)
        .then(obj => {
            res.render('show', obj);
        }).catch(err => {
            handleError(res, err);
        });
});

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

app.listen(3000, () => {
    console.log('l')
});

module.exports = app;