'use strict';
import express from 'express';
import path from 'path';
import url from 'url';
import DidManager from './didManager.js';
import crypto from 'crypto';

const app = express();
const port = '8080';

const didManager = new DidManager();

const logger = function(req, res, next) {
  console.log('[server] Request URL:', req.originalUrl);
  next();
};

app.use(logger);

app.listen(port, () =>
  console.log('Server started at http://localhost:' + port)
);

//TODO create subfiles with logic

// viewed at http://localhost:port
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/credential', function(req, res) {
  res.sendFile(path.join(__dirname + '/credential.html'));
});

app.get('/newDid', function(req, res) {
  didManager.newEthrDid();
  res.redirect('/');
});

app.get('/credentialRequest', function(req, res) {
  //TODO set claim && https://www.w3.org/TR/vc-data-model/
  const claim = {
    credentialSubject: {
      id: 'please set',
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

async function createLoginJWT() {
  const nonce = crypto.randomBytes(24).toString('Base64');
  const payload = {
    response_type: 'id_token',
    client_id: 'http://localhost:8080',
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
      client_id: 'http://localhost:8080',
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
    pathname: 'didapp://credential',
    query: { credential }
  });
}
