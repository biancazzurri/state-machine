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

async function onRegisterMachine(machine, context) {
    let id = uuidv1()
    let tableName = "dev-machine-spec";
    var params = {
        TableName: tableName,
        Item: {
            id: id,
            machineSpec: JSON.stringify(machine)
        }
    }

    dynamodb.put(params).promise().then(data => {
        data = Object.assign({id:id},data);
        context.send({id: id});
    })
}

app.post('/registerMachine/', (req, context) => {
    onRegisterMachine(req.params['machine'], context);
})

module.exports = app;