const express = require('express');
const router = express.Router();
const Author = require('../schemas/author');
const auth = require('../middlewares/auth')();
const Emojipack = require('../schemas/emojipack');
const Country = require('../schemas/country');
const Countrycount = require('../schemas/countrycount');
const Agecount = require('../schemas/agecount');
require('dotenv').config();

//반려 페이지 보기

//반려 페이지 제안 삭제하기

//반려 페이지 다시 제안하기

//국가별 판매량
router.get('/emojipack/:id/country',auth.authenticate(),async(req,res,next)=>{
    try{
        const exEmojipack = await Emojipack.findOne({_id:req.params.id});
        const exCountrycounts = await Countrycount.find({emojipack:exEmojipack._id});
        if(exCountrycounts){
            res.sendStatus(200).json(exCountrycounts);
        }else{
            res.sendStatus(202);
        }
    }catch(error){
        next(error);
    }
});


//연령별 판매량
router.get('/emojipack/:id/age',auth.authenticate(),async(req,res,next)=>{
    try{
        const exEmojipack = await Emojipack.findOne({_id:req.params.id});
        const exCountrycounts = await Agecount.find({emojipack:exEmojipack._id});
        if(exCountrycounts){
            res.sendStatus(200).json(exCountrycounts);
        }else{
            res.sendStatus(202);
        }
    }catch(error){
        next(error);
    }
});





module.exports = router;
