'use strict'
let request = require('request-promise');
let Promise = require('promise');

let Zendesk = module.exports = function(config) {
    this.baseUrl = `${config.baseUrl}/api/v2/`;
    this.username = config.username;
    this.password = config.password;
};

Zendesk.prototype.generatorAuth = function(uri, method){
    uri = `${this.baseUrl}${uri}`;
    return {
        uri: uri,
        method: method,
        auth: {
            username: this.username,
            password: this.password,
        }
    }
};

Zendesk.prototype.tickets = function(page) {
    return new Promise((resolve, reject) => {
        const pageLimit = 25;
        request(this.generatorAuth('tickets.json', 'GET'))
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

Zendesk.prototype.ticket = function(id, page) {
    return new Promise((resolve, reject) => {
        request(this.generatorAuth(`tickets/${id}.json`, 'GET'))
            .then((body) => {
                let ticket = JSON.parse(body).ticket;
                let userId = ticket.requester_id;
                return request(this.generatorAuth(`users/${userId}.json`, 'GET')).then((body) => [ticket, body]);
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