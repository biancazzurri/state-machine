const express = require('express')
const serverless = require('serverless-http')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

function processCurrentState() {
    return {name: 'current'}
}

function processHandleState(event) {
    return ({name: 'handle', event: event})
    res.send({data: 'current'})
}

app.get('/currentState/', (req,res) => {
    res.send(processCurrentState())
})
app.post('/handleState/', (req,res) => {
    res.send(processHandleState(req.param('event')))
})

module.exports.handler = serverless(app);