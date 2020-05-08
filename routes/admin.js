import express from 'express';
import path from 'path';
import DidManager from '../services/didManager.js';

const HTML_PATH = '../pages/admin/';

const didManager = new DidManager();

const router = express.Router();

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, HTML_PATH, 'admin.html'));
});

router.get('/newDid', function (req, res) {
  didManager.newEthrDid();
  res.redirect('/admin');
});

router.get('/setServiceEndpoint', function (req, res) {
  setServiceEndpoint()
    .then((obj) => {
      console.log(obj);
      res.redirect('/admin');
    })
    .catch((error) => {
      console.trace(error);
      res.redirect('/admin');
    });
});

async function setServiceEndpoint() {
  return await didManager.ethrDid.setServiceEndpoint(
    'CredentialService',
    'localhost:8080/institution/a/credential'
  );
}

export default router;
