'use strict';

let config = require('config');
const AWS = require('aws-sdk'); 

const client = new AWS.DynamoDB.DocumentClient(config['DynamoDb']);

module.exports = client;