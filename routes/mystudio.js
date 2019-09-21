const express = require('express');
const router = express.Router();
const Author = require('../schemas/author');
const auth = require('../middlewares/auth')();

require('dotenv').config();




module.exports = router;
