'use strict';
let express = require('express');
let app = express();
let request = require('request-promise');
let yamljs = require('yamljs');
let Zendesk = require('./api/zendesk');

let config = yamljs.load('config.yaml');

let zendesk = new Zendesk(config);

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
    if(!req.query.page){
      res.render('error',{
          error: {title: "Page not defined", message: "Please input page"},
          statusCode: 500 
      });
    }
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
    console.log('Zendesk app listening on port 3000')
});

app.use(function(req,res){
    res.render('error',{
          error: {title: "Page not found", message: "Page not found!!!!"},
          statusCode: 404 
      });
});

module.exports = app;