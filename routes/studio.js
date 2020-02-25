const express = require('express');
const router = express.Router();
const Author = require('../schemas/author');
const User = require('../schemas/user');
const Wallet = require('../schemas/wallet');
const auth = require('../middlewares/auth')();

const multer = require('multer');
const fs = require('fs');

require('dotenv').config();

const upload = multer({
    dest: "profile/"
})






module.exports = router;
