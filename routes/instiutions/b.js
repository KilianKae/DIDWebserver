import express from 'express';
import path from 'path';

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

export default router;
