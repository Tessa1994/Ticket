'use strict'
let express = require('express');
let app = express();
let request = require('request-promise');
let yamljs = require('yamljs');


app.set('view engine', 'pug');
let config = yamljs.load('config.yaml');
function generatorAuth(uri,method){
    uri = `${config.baseUrl}/api/v2/${uri}`;   
    return {
        uri: uri,
        method: method,
        auth: {
            username:config.username, 
            password:config.password
        }
    }
}

app.get('/', (req, res) => {
    const pageLimit = 25;
    let page = req.query.page?req.query.page:1;    
    request(generatorAuth('tickets.json','GET'))
    .then((body)=> {
        let tickets = JSON.parse(body).tickets;
        let count = tickets.length;
        let pages = Math.ceil(count/pageLimit);
        let end = pages === page?tickets.length-1:page*pageLimit;
        let pageCount =pages === page? count%pageLimit:pageLimit;
        tickets = tickets.slice((page-1)*pageLimit, end); 
        res.render('index', {
            page: page,
            count: count,
            pageCount:pageCount,
            pages: pages,
            tickets: tickets
        });
    })
    .catch(err =>{
        console.log(err);
    })
});

app.get('/:id', (req, res) => {
    let id = req.params.id;
    
    request(generatorAuth(`tickets/${id}.json`,'GET'))
    .then((body)=>{
        let ticket = JSON.parse(body).ticket;
        let userId = ticket.requester_id;
        return request(generatorAuth(`users/${userId}.json`,'GET')).then((body)=> [ticket,body]);
    })
    .then(([ticket,body])=>{
       let user = JSON.parse(body).user;
            res.render('show', {
                ticket: ticket,
                username: user.name,
                page: req.query.page
            });
    })
    .catch(err => console.log(err));
       
});


app.listen(3000, () => {
    console.log('l')
});