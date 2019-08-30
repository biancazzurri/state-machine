'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dynamodb = require('./dynamodb');

function onState() {
    // return {name: fsm.state}
    return {name: "123123"}
}

app.get('/state/', (req,res) => {
    res.send(onState());
})

function onEvent(event) {
    // let fn = fsm[event]
    // if (typeof fn == 'function') {
    //     fn.bind(fsm)()
    // }
    // return ({name: fsm.state})
    return {name: "132123123"}
}

app.post('/event/', (req,res) => {
    res.send(onEvent(req.param('event')));
})

function onRegisterMachine(machine) {
    return {id: "123123"}
}

app.post('/registerMachine/', (req, res) => {
    res.send(onRegisterMachine(req.param('machine')))
})

module.exports = app;