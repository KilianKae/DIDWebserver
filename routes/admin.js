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

export default router;
