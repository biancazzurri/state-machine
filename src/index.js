const serverless = require('serverless-http')
let StateMachine = require('javascript-state-machine')

const server = require('./server');
                                      
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

module.exports.handler = serverless(server);
module.exports.processAddMachineSpec = processAddMachineSpec;