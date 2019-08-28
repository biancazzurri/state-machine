const express = require('express')
const serverless = require('serverless-http')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

function processCurrentState() {
    return {name: 'current'}
}

function processHandleEvent(event) {
    return ({name: 'event', event: event})
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