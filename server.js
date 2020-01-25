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

app.get('/didLogin', function(req, res) {
  console.log('[server] Received get /didLogin request');
  createLoginJWT()
    .then(jwt => {
      const url = createLoginUrl(jwt);
      console.log('[server] Redirecting to', url);
      res.redirect(url);
    })
    .catch(error => console.log('[server] createLogin', error));
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
