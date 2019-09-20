const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Author = require('../schemas/author');

/* GET home page. */

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
router.post


module.exports = router;
