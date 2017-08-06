'use strict'
let request = require('request-promise');
let yamljs = require('yamljs');
let Promise = require('promise');

let config = yamljs.load('config.yaml');

function generatorAuth(uri, method) {
    uri = `${config.baseUrl}/api/v2/${uri}`;
    return {
        uri: uri,
        method: method,
        auth: {
            username: config.username,
            password: config.password
        }
    }
}
module.exports.tickets = (page) => {
    return new Promise((resolve, reject) => {
        const pageLimit = 25;
        request(generatorAuth('tickets.json', 'GET'))
            .then((body) => {
                let tickets = JSON.parse(body).tickets;
                let count = tickets.length;
                let pages = Math.ceil(count / pageLimit);
                let end = pages === page ? tickets.length - 1 : page * pageLimit;
                let pageCount = pages === page ? count % pageLimit : pageLimit;
                tickets = tickets.slice((page - 1) * pageLimit, end);
                resolve({
                    page: page,
                    count: count,
                    pageCount: pageCount,
                    pages: pages,
                    tickets: tickets
                });
            })
            .catch(err => reject(err));
    });
};

module.exports.ticket = (id, page) => {
    return new Promise((resolve, reject) => {
        request(generatorAuth(`tickets/${id}.json`, 'GET'))
            .then((body) => {
                let ticket = JSON.parse(body).ticket;
                let userId = ticket.requester_id;
                return request(generatorAuth(`users/${userId}.json`, 'GET')).then((body) => [ticket, body]);
            })
            .then(([ticket, body]) => {
                let user = JSON.parse(body).user;
                resolve({
                    ticket: ticket,
                    username: user.name,
                    page: page
                });
            })
            .catch(err => reject(err));
    });

};