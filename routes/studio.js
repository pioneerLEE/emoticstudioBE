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

//등록(작가)
router.post('/register/author',auth.authenticate(),async(req,res,next)=>{
    const { nick, birth, /*country*/ } = req.body;
    try{
      const exUser = await User.findOne({_id:req.user._id});
      //const exCountry = await Country.findOne({name:country});
      const exAuthor = new Author({
        user:exUser._id,
        nick,
        birth,
        //country: exCountry
      });
      const exWallet = new Wallet({
        owner:exUser._id,
        money:0
      });
      exUser.company = exAuthor._id;
      exUser.save();
      exAuthor.save();
      exWallet.save();
      res.json(201);
    }catch(error){
      next(error);
    }
});


/*
//작가 정보 수정
router.patch('/author',auth.authenticate(),upload.single('profile'),async(req,res,next)=>{
    const { nick, password, newPassword } = req.body;
    try{
        //비밀번호 바꾸기
        if(password && newPassword){

        }
        //닉네임 바꾸기
        if(nick)
        //이미지 업로드
    }catch(error){
        next(error);
    }
})*/




module.exports = router;
