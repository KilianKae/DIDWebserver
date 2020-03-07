'use strict';
import express from 'express';
import path from 'path';
import config from './config';
import middelwares from './midelwares';
import auth from './routes/auth';
import url from 'url';
import { getUserDID } from './routes/auth';
import DidManager from './didManager.js';

const didManager = new DidManager();
const app = express();

app.use(middelwares.logger);

app.listen(config.port, () =>
  console.log('Server started at http://localhost:' + config.port)
);

app.listen(config.port, config.ip, () =>
  console.log('Server started at ', config.ip, 'port:', config.port)
);

app.use('/institution/a/auth', auth);
app.use('/institution/b/auth', auth);

//TODO create subfiles with logic

// viewed at http://localhost:port
app.get('/institution/a', function(req, res) {
  res.sendFile(path.join(__dirname + '/institution/a/login.html'));
});

app.get('/institution/b', function(req, res) {
  res.sendFile(path.join(__dirname + '/institution/b/login.html'));
});

app.get('/institution/a/credential', function(req, res) {
  res.sendFile(path.join(__dirname + '/institution/a/credential.html'));
});

app.get('/institution/b/accessProtectedResource', function(req, res) {
  res.sendFile(path.join(__dirname + '/institution/b/protectedResource.html'));
});

app.get('/institution/b/protectedResource', function(req, res) {
  res.sendFile(path.join(__dirname + '/institution/b/protected.html'));
});

app.get('/newDid', function(req, res) {
  didManager.newEthrDid();
  res.redirect('/');
});

app.get('/institution/a/getCredential', function(req, res) {
  //TODO set claim && https://www.w3.org/TR/vc-data-model/
  const claim = {
    credentialSubject: {
      id: getUserDID(),
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

app.get('/institution/a/credentialRequest', function(req, res) {
  res.redirect(createCredentialRequestUrl());
});

app.get('/institution/b/protectedResource', function(req, res) {
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
    res.redirect('/institution/b/protectedResource');
  }
});

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

const client_id_base = 'http://' + config.ip + ':' + config.port;

function createCredentialRequestUrl() {
  const returnUrl = client_id_base + '/institution/b/protectedResource';
  return url.format({
    pathname: 'didapp://credentials',
    query: { returnUrl }
  });
}
