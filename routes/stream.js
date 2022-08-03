const express = require('express');
const router = express.Router();

const gameController = require('../controllers/game');

router.ws('/', gameController.stream);

module.exports = router;
