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

    describe('register machine', () => {
        it('it should register a machine', (done) => {
            chai.request(server)
            .post('/registerMachine')
            .end((err, result) => {
                result.should.have.status(200);
                result.should.be('json');
                result.should.have.a('id');
                let id = result['id'];
            });

            done();
        })
    })
})