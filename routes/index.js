//brew services start mongodb-community

const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();
const User = require('../schemas/user');
const Author = require('../schemas/author');
const Normaluser = require('../schemas/normaluser');
const Company = require('../schemas/company');
const Wallet = require('../schemas/wallet');
const Country = require('../schemas/country');

const JWT = require("jsonwebtoken");
const auth = require('../middlewares/auth')();
const cfg = require('../jwt_config');
const fs = require('fs');
require('dotenv').config();

const multer = require('multer');

const upload = multer({
    dest: "comanyLogo/"
})

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);//sendgrid 설정

//이메일 인증
router.get('/signup/confirmEmail',async(req,res,next)=>{
  const key_for_verify=req.query.key
  try{
    const exUser = await User.updateOne({key_for_verify},{email_verified:true});
    if(exUser.n){
      res.send(200)
    }else{
      res.send(401)
    }
  }catch(error){
    next(error);
  }
});

//회원가입(유저)
router.post('/signup/user',async(req,res,next)=>{
  const { email, password } = req.body;
  try{
    const checkUser = await User.findOne({email});
    if(checkUser){ //email 중복 체크
      res.sendStatus(401);
    }else{ //회원가입
      let key_for_verify = crypto.randomBytes(256).toString('hex').substr(100, 5)
      key_for_verify += crypto.randomBytes(256).toString('base64').substr(50, 5); //인증 키
      const url = 'http://' + req.get('host')+'/signup/confirmEmail'+'?key='+key_for_verify; //인증을 위한 주소
      const hash = await bcrypt.hash(password, 5);
      const exUser = new User({
        email,
        password:hash,
        key_for_verify
      });
      const msg = { //인증 메일
        to: email,
        from: 'sltkdaks@naver.com', //나중에 회사 메일 하나 만들기
        subject: '회원가입 완료',
        html : '<h1>이메일 인증을 위해 URL을 클릭해주세요.</h1><br>'+url
      };
      sgMail.send(msg);
      exUser.save();
      res.sendStatus(201);
    }
  }catch(error){
    next(error);
  }
});
//등록(회사)
router.post('/register/company',auth.authenticate(),/*upload.files('logo'),*/async(req,res,next)=>{
  const { name, link, summary } = req.body;
  const logoFile = req.file;
  try{
    const exUser = await User.findOne({_id:req.user._id});
    const exCompany = new Company({
      user:exUser._id,
      name,
      link,
      summary,
      logo:`emoji/${name}/logo.${ext}`,
    });
    const exWallet = new Wallet({
      owner:exUser._id,
      money:0
    });
    exUser.company = exCompany._id;
    fs.mkdir(`emoji/${name}`,(err)=>{
      if(err){
          next(err)
      }
    });
    fs.rename(logoFile.path,`emoji/${name}/logo.${ext}`,(err)=>{
      if(err){
          next(err)
      }
    });
    exUser.save();
    exCompany.save();
    exWallet.save();
    res.json(201);
  }catch(error){
    next(error);
  }
});


//등록(일반회원)
router.post('/register/user',auth.authenticate(),async(req,res,next)=>{
  const { birth } = req.body;
  try{
    const exUser = await User.findOne({_id:req.user._id});
    
    const exNormaluser = new Normaluser({
      user:exUser._id,
      birth
    })
    exUser.company = exNormaluser._id;
    exUser.save();
    exNormaluser.save();
    res.json(201);
  }catch(error){
    next(error);
  }
});

//이메일 중복 체크
router.post('/signup/email',async(req,res,next)=>{
  const {email} = req.body;
  try{
    const [checkUser] = await User.find({email});
    console.log(checkUser)
    if(checkUser){ //email 중복됨
      res.send(200);
    }else{ //중복되지 않는 이메일
      res.send(204);
    }
  }catch(error){
    next(error);
  }
});

//로그인
router.post('/signin',async(req,res,next)=>{
  const {email, password} = req.body;
  try{
    const exUser = await User.findOne({email});
    const result = await bcrypt.compare(password,exUser.password);

    if(result){
      let token = JWT.sign({
        _id:exUser._id
      },
      cfg.jwtSecret,    // 비밀 키
      {
        expiresIn: '30 days'    // 유효 시간은 30일
      });
      res.status(200).json({
        token: token,
        User: exUser
      });
    }else{
      res.send(401); //수정해야함
      
    }
  }catch(error){
    next(error);
  }
});

module.exports = router;
