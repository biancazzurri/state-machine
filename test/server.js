'use strict';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../src/server');
let should = chai.should();

chai.use(chaiHttp);

let port = 3000;

describe('Server', () => {
    let s = null;

    before(() => {
        s = server.listen(port, () => console.log(`Listening on port ${port}`));
    });

    after(() => {
        s.close();
    });

    let machineSpec = {
        init: 'solid',
        transitions: [
          { name: 'melt',     from: 'solid',  to: 'liquid' },
          { name: 'freeze',   from: 'liquid', to: 'solid'  },
          { name: 'vaporize', from: 'liquid', to: 'gas'    },
          { name: 'condense', from: 'gas',    to: 'liquid' }
        ]
    };

    describe('Machine Lifecycle', () => {
        let registeredMachineId = null;
        let machineInstanceId = null;

        it('should register a machine', done => {
            chai
            .request(server)
            .post('/machine')
            .set('content-type', 'application/json')
            .send({machine: machineSpec})
            .end((err, result) => {
                result.should.have.status(200);
                result.body.should.be.a('object');
                result.body.should.have.all.keys('machineId');
                registeredMachineId = result.body['machineId'];
                done();
            });
        });

        it('should retrieve registered machine', done => {
            chai
            .request(server)
            .get(`/machine/${registeredMachineId}`)
            .end((err, result) => {
                result.should.have.status(200);
                result.body.should.be.a('object');
                result.body.should.have.all.keys('spec');
                JSON.parse(result.body['spec']).should.deep.equal(machineSpec);

                done();
            });
        });

        it('should return error for non existent machine retrieval', done => {
            chai
            .request(server)
            .get('/machine/non-existent-id')
            .end((err, result) => {
                result.should.have.status(400);
                result.body.should.be.a('object');
                result.body.should.have.all.keys('text');
                result.body['text'].should.equal('Machine not found')
                done();
            });
        });

        it('should create machine instance', done => {
            chai
            .request(server)
            .post('/instance')
            .set('content-type', 'application/json')
            .send({machineId: registeredMachineId})
            .end((err, result) => {
                result.should.have.status(200);
                result.body.should.be.a('object');
                result.body.should.have.all.keys('instanceId');
                machineInstanceId = result.body['instanceId'];
                done();
            });
        });

        it('should return error for non existing machine instance creation', done => {
            chai
            .request(server)
            .post('/instance')
            .set('content-type', 'application/json')
            .send({machineId: 'non-extisting-key'})
            .end((err, result) => {
                result.should.have.status(400);
                result.body.should.be.a('object');
                result.body.should.have.all.keys('text');
                result.body['text'].should.equal('Machine not found')
                done();
            });
        });

        it('should retrieve instance state', done => {
            chai
            .request(server)
            .get(`/instance/${machineInstanceId}`)
            .end((err, result) => {
                result.should.have.status(200);
                result.body.should.be.a('object');
                result.body.should.have.all.keys('currentState','availableEvents');
                result.body['currentState'].should.be.equal('solid');
                result.body['availableEvents'].should.deep.equal(['melt']);
                done();
            });
        });

        it('should return 400 on non existent instance', done => {
            chai
            .request(server)
            .get('/instance/non-existent-id')
            .end((err, result) => {
                result.should.have.status(400);
                result.body.should.be.a('object');
                result.body.should.have.all.keys('text');
                result.body['text'].should.equal('Instance not found')
                done();
            });
        });

        it('should return machine state on event', done => {
            chai
            .request(server)
            .put(`/instance/${machineInstanceId}`)
            .set('content-type', 'application/json')
            .send({event: 'melt'})
            .end((err, result) => {
                result.should.have.status(200);
                result.body.should.be.a('object');
                result.body.should.have.all.keys('currentState','availableEvents');
                result.body['currentState'].should.be.equal('liquid');
                result.body['availableEvents'].should.deep.equal(['freeze','vaporize']);
                done();
            });
        });

        it('should retrieve instance state 2', done => {
            chai
            .request(server)
            .get(`/instance/${machineInstanceId}`)
            .end((err, result) => {
                result.should.have.status(200);
                result.body.should.be.a('object');
                result.body.should.have.all.keys('currentState','availableEvents');
                result.body['currentState'].should.be.equal('liquid');
                result.body['availableEvents'].should.deep.equal(['freeze','vaporize']);
                done();
            });
        });

        it('should ignore handle non relevant events', done => {
            chai
            .request(server)
            .put(`/instance/${machineInstanceId}`)
            .set('content-type', 'application/json')
            .send({event: 'melt'})
            .end((err, result) => {
                result.should.have.status(200);
                result.body['currentState'].should.be.equal('liquid');
                done();
            });      
        });

        it('should return 400 for event for non existent instance', done => {
            chai
            .request(server)
            .put('/instance/non-existent-id')
            .set('content-type', 'application/json')
            .send({event: 'melt'})
            .end((err, result) => {
                result.should.have.status(400);
                result.body.should.be.a('object');
                result.body.should.have.all.keys('text');
                result.body['text'].should.equal('Instance not found')
                done();
            });  
        })
    })
})