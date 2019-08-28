const express = require('express')
const serverless = require('serverless-http')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/currentState/', (req, res) => {
    res.send({data: 'current'})
})

app.post('/handleState/', (req, res) => {
    res.send({data: 'handle'})
})

module.exports.handler = serverless(app)