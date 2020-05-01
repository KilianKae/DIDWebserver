import express from 'express';
import path from 'path';

const router = express.Router();

const HTML_PATH = '../../institution/a/';

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, HTML_PATH, 'login.html'));
});
router.get('/credential', function (req, res) {
  res.sendFile(path.join(__dirname, HTML_PATH, 'credential.html'));
});

export default router;
