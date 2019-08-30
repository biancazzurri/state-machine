const express = require('express')
const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const uuidv1 = require('uuid/v1')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

let StateMachine = require('javascript-state-machine')
const dynamodb = require('./dynamodb');
                                      
function processAddMachineSpecInternal(tableName, machineSpec) {
    let id = uuidv1()
    var params = {
        TableName: tableName,
        Item: {
            id: id,
            machineSpec: JSON.stringify(machineSpec)
        }
    }

    return dynamodb.put(params).promise().then(data => {
        data = Object.assign({id:id},data);
        return {id: id};
    })
}

function processAddMachineSpec(machineSpec) {
    return processAddMachineSpecInternal("dev-machine-spec", machineSpec)
}

function processCurrentState() {
    return {name: fsm.state}
}

function processHandleEvent(event) {
    let fn = fsm[event]
    if (typeof fn == 'function') {
        fn.bind(fsm)()
    }
    return ({name: fsm.state})
}

app.get('/currentState/', (req,res) => {
    res.send(processCurrentState())
})
app.post('/handleEvent/', (req,res) => {
    res.send(processHandleEvent(req.param('event')))
})

module.exports.handler = serverless(app);
module.exports.processHandleEvent = processHandleEvent;
module.exports.processCurrentState = processCurrentState;
module.exports.processAddMachineSpec = processAddMachineSpec;