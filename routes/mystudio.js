const express = require('express');
const router = express.Router();
const Author = require('../schemas/author');
const auth = require('../middlewares/auth')();

require('dotenv').config();

//isAnimated , name , tag , price , summary , emoji 28개

//새로운것 post /proposal/new

router.post('/proposal/new',auth.authenticate(),async(req,res,next)=>{
    console.log('req:',req.user);
    res.send(200);
});






//반려된것(+반려사유) 재제안 put /proposal/:name

// patch /proposal/:name

module.exports = router;
