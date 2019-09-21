const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();
const Author = require('../schemas/author');
const JWT = require("jsonwebtoken");
const auth = require('../middlewares/auth')();
const cfg = require('../jwt_config');
require('dotenv').config();

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);//sendgrid 설정

//이메일 인증
router.get('/signup/author/confirmEmail',async(req,res,next)=>{
  const key_for_verify=req.query.key
  try{
    const exAuthor=await Author.updateOne({key_for_verify},{email_verified:true});
    if(exAuthor.n){
      res.send(200)
    }else{
      res.send(401)
    }
  }catch(error){
    next(error);
  }
});


//signup name email password birth 
router.post('/signup/author',async(req,res,next)=>{
  const { email, password, name, birth } = req.body;
  try{
    const [checkAuthor] = await Author.find({email});
    if(checkAuthor){ //email 중복 체크
      res.send(401);
    }else{ //회원가입
      var key_for_verify = crypto.randomBytes(256).toString('hex').substr(100, 5)
      key_for_verify += crypto.randomBytes(256).toString('base64').substr(50, 5); //인증 키
      const url = 'http://' + req.get('host')+'/signup/author/confirmEmail'+'?key='+key_for_verify; //인증을 위한 주소
      const hash = await bcrypt.hash(password, 5);
      const exAuthor = new Author({
        name:name,
        email,
        password:hash,
        birth,
        key_for_verify
    });
    const msg = { //인증 메일
      to: email,
      from: 'sltkdaks@naver.com', //나중에 회사 메일 하나 만들기
      subject: '회원가입 완료',
      html : '<h1>이메일 인증을 위해 URL을 클릭해주세요.</h1><br>'+url
    };
    sgMail.send(msg);
    await exAuthor.save();
    res.json(201);
    }
  }catch(error){
    next(error);
  }
});
router.post('/signup/author/email',async(req,res,next)=>{
  const {email} = req.body;
  try{
    const [checkAuthor] = await Author.find({email});
    console.log(checkAuthor)
    if(checkAuthor){ //email 중복됨
      res.send(200);
    }else{ //중복되지 않는 이메일
      res.send(204);
    }
  }catch(error){
    next(error);
  }
});

router.post('/signin/author',async(req,res,next)=>{
  const {email, password} = req.body;
  try{
    const [exAuthor] = await Author.find({email});
    const result = await bcrypt.compare(password,exAuthor.password);

    if(result){
      console.log(exAuthor._id)

      let token = JWT.sign({
        _id:exAuthor._id
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
