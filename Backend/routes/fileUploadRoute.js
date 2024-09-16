const express = require('express');
const multer = require('multer');
const { processFile } = require('../controllers/fileController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), processFile);

module.exports = router;
