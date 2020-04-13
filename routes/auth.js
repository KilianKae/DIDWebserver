import express from 'express';
import crypto from 'crypto';
import url from 'url';

import config from '../config';
import DidManager from '../didManager.js';

const router = express.Router();
const didManager = new DidManager();

let userDID = '';
const client_id_base =
  'http://' + config.ip + ':' + config.port + '/institution';

const SIOP_REQUEST_URL_A = '/a/auth/siopRequest';
const SIOP_REQUEST_URL_B = '/b/auth/siopRequest';
const SIOP_RESPONSE_URL_A = '/a/auth/siopResponse';
const SIOP_RESPONSE_URL_B = '/b/auth/siopResponse';

const clientA_id = client_id_base + SIOP_RESPONSE_URL_A;
const clientB_id = client_id_base + SIOP_RESPONSE_URL_B;

router.get(SIOP_REQUEST_URL_A, function (req, res) {
  handleSIOPRequest(res, clientA_id);
});

router.get(SIOP_REQUEST_URL_B, function (req, res) {
  handleSIOPRequest(res, clientB_id);
});

function handleSIOPRequest(res, client_id) {
  createLoginJWT(client_id)
    .then((jwt) => {
      const url = createLoginUrl(jwt, client_id);
      console.log('[server] Redirecting to', url);
      res.redirect(url);
    })
    .catch((error) => console.log('[server] createLogin', error));
}

router.get(SIOP_RESPONSE_URL_A, function (req, res) {
  handleSIOPResponse(req, res, '/institution/a/credential');
});

router.get(SIOP_RESPONSE_URL_B, function (req, res) {
  handleSIOPResponse(req, res, '/institution/b/accessProtectedResource');
});

function handleSIOPResponse(req, res, redirectUrl) {
  //TODO check if id_token is available
  const id_token = req.query.id_token;
  console.log('[server] req id_token', id_token);
  //TODO add database check & token generation
  validateSiopResponse(id_token)
    .then((obj) => {
      //res.status(200).json({ login: true });
      //TODO Multi User
      userDID = obj.issuer;
      res.redirect(redirectUrl);
    })
    .catch((error) => {
      //TODO correct error message
      res.status(400).json({
        error: 'Bad Request',
        message: error.toString(),
      });
    });
}

async function createLoginJWT(client_id) {
  const nonce = crypto.randomBytes(24).toString('Base64');
  const payload = {
    response_type: 'id_token',
    client_id,
    scope: 'openid did_authn',
    nonce,
    response_mode: 'query',
    // registration: {
    //   jwks_uri:
    //     'https://uniresolver.io/1.0/identifiers/did:example:0xab;transform-keys=jwks',
    //   id_token_signed_response_alg: ['ES256K', 'EdDSA', 'RS256']
    // }
  };
  return await didManager.ethrDid.signJWT({ payload });
}

function createLoginUrl(jwt, client_id) {
  return url.format({
    pathname: 'didapp://login',
    query: {
      response_type: 'id_token',
      client_id,
      scope: 'myid%20did_authn',
      request: jwt,
    },
  });
}

async function validateSiopResponse(jwt) {
  //Use Object Values?
  return await didManager.ethrDid.verifyJWT(jwt);
}

export function getUserDID() {
  return userDID;
}

export default router;
