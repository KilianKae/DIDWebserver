import express from 'express';
import path from 'path';
import url from 'url';
import { client_id_base } from '../../config';
import DidManager from '../../services/didManager.js';

const router = express.Router();
const didManager = new DidManager();

const HTML_PATH = '../../pages/institution/b/';

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, HTML_PATH, 'login.html'));
});

router.get('/accessProtectedResource', function (req, res) {
  res.sendFile(path.join(__dirname, HTML_PATH, 'protectedResource.html'));
});

router.get('/protectedResource', function (req, res) {
  const vp = req.query.vp;
  didManager.ethrDid
    .verifyJWT(vp)
    .then((obj) => {
      //TODO add check for correct claim
      if (obj.issuer === obj.payload.verfiableCredential.credentialSubject.id) {
        res.sendFile(path.join(__dirname, HTML_PATH, 'protected.html'));
      } else {
        res.status(400).json({
          error: 'Bad Request',
          message: error.toString(),
        });
      }
    })
    .catch((error) => {
      //TODO correct error message
      res.status(400).json({
        error: 'Bad Request',
        message: error.toString(),
      });
    });
});

router.get('/credentialRequest', function (req, res) {
  res.redirect(createCredentialRequestUrl());
});

function createCredentialRequestUrl() {
  const returnUrl = client_id_base + '/institution/b/protectedResource';
  //TODO
  const challenge = 'challenge';
  console.log(
    url.format({
      pathname: 'didapp://credentials',
      query: { returnUrl, challenge },
    })
  );
  return url.format({
    pathname: 'didapp://credentials',
    query: { returnUrl, challenge },
  });
}

export default router;
