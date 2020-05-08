import express from 'express';
import path from 'path';
import { getUserDID } from '../auth';
import url from 'url';
import DidManager from '../../services/didManager.js';

//Mock Data
const courses = new Map([
  ['ics', 'Introduction to Computer Science'],
  ['ds', 'Data Structures'],
  ['p', 'Patterns'],
]);

const HTML_PATH = '../../pages/institution/a/';

const didManager = new DidManager();
const router = express.Router();

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, HTML_PATH, 'login.html'));
});
router.get('/credential', function (req, res) {
  res.sendFile(path.join(__dirname, HTML_PATH, 'credential.html'));
});

router.get('/getCredential/:course', function (req, res) {
  //TODO set claim && https://www.w3.org/TR/vc-data-model/
  const course = courses.get(req.params.course);
  const claim = courseCredential(course);
  createCredential(claim)
    .then((credential) => {
      console.log('[server] credential', credential);
      const url = createCredentialUrl(credential);
      console.log('[server] Redirecting to', url);
      res.redirect(url);
    })
    .catch((error) => {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.toString(),
      });
    });
});

async function createCredential(claim) {
  return await didManager.ethrDid.signJWT(claim);
}

function createCredentialUrl(credential) {
  return url.format({
    pathname: 'didapp://credentials',
    query: { credential },
  });
}

function courseCredential(id) {
  return {
    type: ['VerifiableCredential', 'CourseCredential'],
    credentialSubject: {
      id: getUserDID(),
      participantOf: {
        id,
      },
    },
  };
}

export default router;
