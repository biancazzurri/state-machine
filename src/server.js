'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
var StateMachine = require('javascript-state-machine');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let config = require('config');

const dynamodb = require('./dynamodb');

function resolveTableName(tableNameField) {
    return config[tableNameField] || process.env[tableNameField];
}

const machineTableName = resolveTableName('machineTableName');
const instanceTableName = resolveTableName('instanceTableName');
console.log(`Table names: ${machineTableName}, ${instanceTableName}`);

function onState() {
    // return {name: fsm.state}
    return {name: "123123"}
}

function getMachine(machineId) {
    let params = {
        TableName: machineTableName,
        Key: {
            machineId
        }
    };
    
    return new Promise((resolve, reject) => {
        dynamodb.get(params).promise()
        .then(data => {
            if (data.Item) {
                resolve(data.Item);
            } else {
                reject({text: 'Machine not found'})
            }
        })
        .catch(error => {
            reject(error);
        })
    });
}

function instanceState(fsm) {
    return {
        currentState: fsm.state,
        availableEvents: fsm.transitions()
    };
}

function saveInstance(data) {
    let instanceParams = {
        TableName: instanceTableName,
        Item: data
    };

    return dynamodb.put(instanceParams).promise();
}

//create new machine instance using registered spec
app.post('/instance/', (req, context) => {
    let machineId = req.body['machineId'];
    let params = {
        TableName: machineTableName,
        Key: {
            machineId
        }
    };

    getMachine(machineId)
    .then(data => {
        let instanceId = uuidv1();
        saveInstance({machineId, instanceId})
        .then(data => {
            context.send({instanceId});
        })
        .catch(error => {
            context.status(400).send({instanceId});
        });
    })
    .catch(error => {
        context.status(400).send(error);
    });
})

function getInstance(instanceId) {
    let params = {
        TableName: instanceTableName,
        Key: { 
            instanceId 
        }
    }

    return new Promise((resolve, reject) => {
        dynamodb.get(params).promise()
        .then(data => {
            if (data.Item) {
                let instanceData = data.Item;
                getMachine(instanceData.machineId)
                .then(machineData => {
                    let  spec = JSON.parse(machineData.spec);
                    if (instanceData.currentState) {
                        spec['init'] = instanceData.currentState;
                    }
                    instanceData.fsm = new StateMachine(spec);
                    resolve(instanceData);
                })
                .catch(error => {
                    reject(error);
                });
            } else {
                reject({text: 'Instance not found'});
            }
        })
        .catch(error => {
            reject(error);
        })
    });
}

function updateInstanceState(instanceId, currentState) {
    let params = {
        TableName: instanceTableName,
        Key: {
            instanceId
        },
        UpdateExpression: 'set currentState = :x',
        ExpressionAttributeValues: {
            ':x': currentState
        }
    };

    return dynamodb.update(params).promise();
}

//process instance event
app.put('/instance/:instanceId', (req, context) => {
    let instanceId = req.params['instanceId'];
    getInstance(instanceId)
    .then(instanceData => {
        let { instanceId, fsm } = instanceData;
        let event = req.body['event'];
        let fn = fsm[event];
        if (fn && typeof fn == 'function' && fsm.can(event)) {
            fn.bind(fsm)();
        }
        let currentState = fsm.state;
        updateInstanceState(instanceId, currentState)
        .then(data => {
            context.send(instanceState(fsm));
        })
        .catch(error => {
            context.status(400).send(error);
        });
    })
    .catch(error => {
        context.status(400).send(error);
    });
});

//get instance state
app.get('/instance/:instanceId', (req, context) => {
    let instanceId = req.params['instanceId'];
    getInstance(instanceId)
    .then(data => {
        context.send(instanceState(data.fsm));
    })
    .catch(error => {
        context.status(400).send(error);
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

    dynamodb.put(params).promise().then(data => {
        context.send({machineId});
    })
});

//retrieve machine
app.get('/machine/:machineId', (req, context) => {
    let machineId = req.params['machineId'];

    getMachine(machineId)
    .then(data => {
        context.send({spec: data.spec});
    })
    .catch(error => {
        context.status(400).send(error);
    })
});

module.exports = app;