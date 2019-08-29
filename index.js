const express = require('express')
const serverless = require('serverless-http')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

let StateMachine = require('javascript-state-machine')

let fsm = new StateMachine({ init: 'solid',
transitions: [
  { name: 'melt',     from: 'solid',  to: 'liquid' },
  { name: 'freeze',   from: 'liquid', to: 'solid'  },
  { name: 'vaporize', from: 'liquid', to: 'gas'    },
  { name: 'condense', from: 'gas',    to: 'liquid' }
]})

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