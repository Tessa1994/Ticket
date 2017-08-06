'use strict'
let express = require('express');
let app = express();
let request = require('request-promise');
let yamljs = require('yamljs');
let zendesk = require('./api/zendesk');


app.set('view engine', 'pug');

app.get('/', (req, res) => {
    zendesk.tickets(req.query.page ? req.query.page : 1)
        .then(obj => {
            res.render('index', obj);
        }).catch(err => {

        });
});

app.get('/:id', (req, res) => {
    zendesk.ticket(req.params.id, req.query.page)
        .then(obj => {
            res.render('show', obj);
        }).catch(err => {
            console.log(err);
        });
});

app.listen(3000, () => {
    console.log('l')
});