const express = require('express');
const router = express.Router();

const gameController = require('../controllers/game');

router.post('/new', gameController.newGame);
router.post('/join', gameController.joinGame);

module.exports = router;
