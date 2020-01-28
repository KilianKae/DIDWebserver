'use strict';
import express from 'express';
import path from 'path';
import querystring from 'querystring';
import DidManager from './didManager.js';
import crypto from 'crypto';

const app = express();

var getResolver = require('ethr-did');
var EthrResolver = require('ethr-did-resolver');

const didManager = new DidManager();
const port = '8080';
//TODO create supfiles with logic

// viewed at http://localhost:port
app.get('/', function(req, res) {
  console.log('[server] Received get / request');
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/newDid', function(req, res) {
  console.log('[server] Received get /newDid request');
  didManager.newEthrDid();
  res.redirect('/');
});

app.get('/siopRequest', function(req, res) {
  console.log('[server] Received get /siopRequest request');
  createLoginJWT()
    .then(jwt => {
      const url = createLoginUrl(jwt);
      console.log('[server] Redirecting to', url);
      res.redirect(url);
    })
    .catch(error => console.log('[server] createLogin', error));
});

//TODO should be post request
app.get('/siopResponse', function(req, res) {
  console.log('[server] Received get /siopResponse request');
  //TODO check if id_token is available
  const id_token = req.query.id_token;
  console.log('[server] req id_token', id_token);
  //TODO add database check & token generation
  validateSiopResponse(id_token)
    .then(obj => {
      res.status(200).json({ login: true });
    })
    .catch(error => {
      //TODO correct error message
      console.error('[server] error', error);
      res.status(400).json({
        error: 'Bad Request',
        message: error.toString()
      });
    });
});

app.listen(port, () =>
  console.log('Server started at http://localhost:' + port)
);

function createLoginJWT() {
  const nonce = crypto.randomBytes(24).toString('Base64');
  return didManager.ethrDid.signJWT({ nonce });
}

function createLoginUrl(jwt) {
  const base = 'didapp://login?';
  const query = {
    response_type: 'id_token',
    client_id: 'http://localhost:8080',
    scope: 'myid%20did_authn',
    request: jwt
  };
  const url = base + querystring.stringify(query);
  return url;
}

function validateSiopResponse(jwt) {
  //Use Object Values?
  return didManager.ethrDid.verifyJWT(jwt);
}
