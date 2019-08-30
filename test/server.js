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

    describe('register machine', () => {
        it('it should register a machine', (done) => {
            chai.request(server)
            .post('/registerMachine')
            .set('content-type', 'application/json')
            .send({machine: machineSpec})
            .end((err, result) => {
                result.should.have.status(200);
                result.body.should.be.a('object');
                result.body.should.have.all.keys('id');
                //let id = result['id'];
            });

            done();
        })
    })
})