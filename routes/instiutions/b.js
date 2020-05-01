import express from 'express';
import path from 'path';
import url from 'url';
import { client_id_base } from '../../config';

const router = express.Router();

const HTML_PATH = '../../institution/b/';

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, HTML_PATH, 'login.html'));
});

router.get('/accessProtectedResource', function (req, res) {
  res.sendFile(path.join(__dirname, HTML_PATH, 'protectedResource.html'));
});

router.get('/protectedResource', function (req, res) {
  res.sendFile(path.join(__dirname, HTML_PATH, 'protected.html'));
});

router.get('/institution/b/protectedResource', function (req, res) {
  const query = {
    subject: req.query.subject,
    issuer: req.query.issuer,
    signature: req.query.signature,
    claims: JSON.parse(req.query.claims),
  };
  console.log('[server] query', query);
  if (
    query.claims.some(
      (claim) => claim.key === 'group' && claim.value === 'admin'
    )
  ) {
    res.redirect('/institution/b/protectedResource');
  }
});

router.get('/credentialRequest', function (req, res) {
  res.redirect(createCredentialRequestUrl());
});

function createCredentialRequestUrl() {
  const returnUrl = client_id_base + '/institution/b/protectedResource';
  return url.format({
    pathname: 'didapp://credentials',
    query: { returnUrl },
  });
}

export default router;
