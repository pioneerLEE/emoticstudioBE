const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Author = require('../schemas/author');
const JWT = require("jsonwebtoken");
const auth = require('../middlewares/auth')();
const cfg = require('../jwt_config');

//signup name email password birth 
router.post('/signup/author',async(req,res,next)=>{
  const { email, password, name, birth } = req.body;
  try{
    
    const [checkAuthor] = await Author.find({email});
    console.log(checkAuthor)
    if(checkAuthor){ //email 중복 체크
      res.send(401);
    }else{ //회원가입
      const hash = await bcrypt.hash(password, 5);
      const author = await new Author({
        name:name,
        email,
        password:hash,
        birth
    });
    await author.save();
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
    if(email && password){
      const [exAuthor] = await Author.find({email});
      if(exAuthor){
        let payload ={
          _id: email._id
        }
        let token = JWT.sign({
          email: payload
        },
        cfg.jwtSecret,    // 비밀 키
        {
          expiresIn: '30 days'    // 유효 시간은 30일
        });
        res.status(200).json({
          token: token
        });
      }
    }
  }catch(error){
    next(error);
  }
})


module.exports = router;
