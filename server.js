'use strict';
import express from 'express';
import path from 'path';
import url from 'url';
import DidManager from './didManager.js';
import crypto from 'crypto';
import config from './config';
import middelwares from './midelwares';

const app = express();

const didManager = new DidManager();

//TODO
let userDID = '';

app.use(middelwares.logger);

app.listen(config.port, () =>
  console.log('Server started at http://localhost:' + config.port)
);

app.listen(config.port, config.ip, () =>
  console.log('Server started at ', config.ip, 'port:', config.port)
);

//TODO create subfiles with logic

// viewed at http://localhost:port
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/credential', function(req, res) {
  res.sendFile(path.join(__dirname + '/credential.html'));
});

app.get('/protectedResource', function(req, res) {
  res.sendFile(path.join(__dirname + '/protectedResource.html'));
});

app.get('/newDid', function(req, res) {
  didManager.newEthrDid();
  res.redirect('/');
});

app.get('/getCredential', function(req, res) {
  //TODO set claim && https://www.w3.org/TR/vc-data-model/
  const claim = {
    credentialSubject: {
      id: userDID,
      group: 'admin'
    }
  };
  createCredential(claim)
    .then(credential => {
      console.log('[server] credential', credential);
      const url = createCredentialUrl(credential);
      console.log('[server] Redirecting to', url);
      res.redirect(url);
    })
    .catch(error => {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.toString()
      });
    });
});

app.get('/credentialRequest', function(req, res) {
  res.redirect(createCredentialRequestUrl());
});

app.get('/setCredential', function(req, res) {
  const query = {
    subject: req.query.subject,
    issuer: req.query.issuer,
    signature: req.query.signature,
    claims: JSON.parse(req.query.claims)
  };
  console.log('[server] query', query);
  if (
    query.claims.some(claim => claim.key === 'group' && claim.value === 'admin')
  ) {
    res.sendFile(path.join(__dirname + '/protected.html'));
  }
});

app.get('/siopRequest', function(req, res) {
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
  //TODO check if id_token is available
  const id_token = req.query.id_token;
  console.log('[server] req id_token', id_token);
  //TODO add database check & token generation
  validateSiopResponse(id_token)
    .then(obj => {
      //res.status(200).json({ login: true });
      //TODO Multi User
      userDID = obj.issuer;
      res.redirect('/credential');
    })
    .catch(error => {
      //TODO correct error message
      res.status(400).json({
        error: 'Bad Request',
        message: error.toString()
      });
    });
});

const client_id = 'http://' + config.ip + ':' + config.port;

async function createLoginJWT() {
  const nonce = crypto.randomBytes(24).toString('Base64');
  const payload = {
    response_type: 'id_token',
    client_id,
    scope: 'openid did_authn',
    nonce,
    response_mode: 'query'
    // registration: {
    //   jwks_uri:
    //     'https://uniresolver.io/1.0/identifiers/did:example:0xab;transform-keys=jwks',
    //   id_token_signed_response_alg: ['ES256K', 'EdDSA', 'RS256']
    // }
  };
  return await didManager.ethrDid.signJWT({ payload });
}

function createLoginUrl(jwt) {
  return url.format({
    pathname: 'didapp://login',
    query: {
      response_type: 'id_token',
      client_id,
      scope: 'myid%20did_authn',
      request: jwt
    }
  });
}

async function validateSiopResponse(jwt) {
  //Use Object Values?
  return await didManager.ethrDid.verifyJWT(jwt);
}

async function createCredential(claim) {
  //TODO get DID of requester
  return await didManager.ethrDid.signJWT({ claim });
}

function createCredentialUrl(credential) {
  return url.format({
    pathname: 'didapp://credentials',
    query: { credential }
  });
}

function createCredentialRequestUrl() {
  const returnUrl = client_id + '/setCredential';
  return url.format({
    pathname: 'didapp://credentials',
    query: { returnUrl }
  });
}
