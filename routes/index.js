const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();
const User = require('../schemas/user');
const Author = require('../schemas/author');
const Normaluser = require('../schemas/normaluser');
const Company = require('../schemas/company');
const JWT = require("jsonwebtoken");
const auth = require('../middlewares/auth')();
const cfg = require('../jwt_config');
require('dotenv').config();

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
router.post('/signup/user',async(req,res,next)=>{
  const { email, password, nick, birth } = req.body;
  try{
    const [checkUser] = await User.find({email});
    if(checkUser){ //email 중복 체크
      res.send(401);
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
      const exAuthor = new Author({
        user:exUser._id,
        nick,
        birth
      })
      const exNormaluser = new Normaluser({
        user:exUser._id,
        nick,
        birth
      })
      const msg = { //인증 메일
        to: email,
        from: 'sltkdaks@naver.com', //나중에 회사 메일 하나 만들기
        subject: '회원가입 완료',
        html : '<h1>이메일 인증을 위해 URL을 클릭해주세요.</h1><br>'+url
      };
      sgMail.send(msg);
      exUser.save();
      exAuthor.save();
      exNormaluser.save();
      res.json(201);
    }
  }catch(error){
    next(error);
  }
});
//회사 등록
router.post('/signup/company',async(req,res,next)=>{
  const { email, password, name, link, summary } = req.body;
  try{
    const [checkUser] = await User.find({email});
    if(checkUser){ //email 중복 체크
      res.send(401);
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
      const exCompany = new Company({
        user:exUser._id,
        name,
        link,
        summary
      });
      const msg = { //인증 메일
        to: email,
        from: 'sltkdaks@naver.com', //나중에 회사 메일 하나 만들기
        subject: '회원가입 완료',
        html : '<h1>이메일 인증을 위해 URL을 클릭해주세요.</h1><br>'+url
      };
      sgMail.send(msg);
      exUser.save();
      exCompany.save();
      res.json(201);
    }
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
    const [exUser] = await User.find({email});
    const result = await bcrypt.compare(password,exUser.password);

    if(result){
      console.log(exUser._id)

      let token = JWT.sign({
        _id:exUser._id
      },
      cfg.jwtSecret,    // 비밀 키
      {
        expiresIn: '30 days'    // 유효 시간은 30일
      });
      res.status(200).json({
        token: token
      });
    }else{
      res.send(401); //수정해야함
      
    }
  }catch(error){
    next(error);
  }
});

module.exports = router;
