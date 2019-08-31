'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dynamodb = require('./dynamodb');
const machineTableName = 'dev-machine';
const instanceTableName = 'dev-instance';

function onState() {
    // return {name: fsm.state}
    return {name: "123123"}
}

app.get('/instance/:id', (req, res) => {
    let id = req.params['id'];
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

function getMachine(machineId) {
    let params = {
        TableName: machineTableName,
        Key: {
            machineId
        }
    };
    
    return dynamodb.get(params).promise();
}

const machineNotFoundText = 'Machine not found';

//create new machine instance using registered spec
app.post('/instance/', (req, context) => {
    let machineId = req.body['machineId'];
    let params = {
        TableName: machineTableName,
        Key: {
            machineId
        }
    };

    getMachine(machineId).then((data) => {
        if (data.Item) {
            let instanceId = uuidv1();
            let Item = {machineId, instanceId};
            let instanceParams = {
                TableName: instanceTableName,
                Item
            };

            dynamodb.put(instanceParams).promise().then((data) => {
                context.send(Item);
            });
        } else {
            context.status(400).send({text: machineNotFoundText});
        } 
    });
})

//create new machine spec
app.post('/machine/', (req, context) => {
    let machine = req.body['machine'];
    let machineId = uuidv1()
    var params = {
        TableName: machineTableName,
        Item: {
            machineId,
            spec: JSON.stringify(machine)
        }
    }

    dynamodb.put(params).promise().then((data) => {
        context.send({machineId});
    })
});

//retrieve machine
app.get('/machine/:machineId', (req, context) => {
    let machineId = req.params['machineId'];

    getMachine(machineId).then((data) => {
        if (data.Item) {
            context.send({spec: data.Item.spec});
        } else {
            context.status(400).send({text: machineNotFoundText});
        }
    })
});

module.exports = app;