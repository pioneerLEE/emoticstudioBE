const express = require('express');
const router = express.Router();
const Author = require('../schemas/author');
const Emojipack = require('../schemas/emojipack');
const Emoji = require('../schemas/emoji');
const auth = require('../middlewares/auth')();
const rimraf = require('rimraf');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Account = require('../schemas/account');
const Bank = require('../schemas/bank');
const Modificationreq = require('../schemas/modificationreq');

require('dotenv').config();

const upload = multer({
    dest: "emoji/"
})

//isAnimated , name , tag , price , summary , emoji 28개
//새로운것 post /proposal/new


//은행 등록
router.post('/account/new',auth.authenticate(),async(req,res,next)=>{
    const { bank, number } = req.body;
    try{
        const exBank = Bank.findOne({name:bank});
        const newAccount = new Account.create({
            owner:req.user._id,
            bank:exBank._id,
            number,
        });
        newAccount.save();
        res.json(201);
    }catch(error){
        next(error);
    }
});
//새로운 이모티콘팩 등록 // 태그 업데이트 따로 router 제작 //지원 서비스 업데이트 따로 router 제작 //언어 생성 router 제작 //
router.post('/proposal/new',auth.authenticate(),upload.array('emoji', 30),async(req,res,next)=>{ 
    const { isAnimated , name , keyword , price , summary, language } = req.body;
    const emojiFiles = req.files;
    let isFree = true;
    try{
        const exAuthor = await Author.findOne({user:req.user._id});
        //const exLanguage = await Language.findOne({name:language});
        const notNew = await Emojipack.findOne({name:name});
        if(parseFloat(price)){
            isFree = false;
            console.log(price);
        }
        if(!notNew){
            const exEmojipack = new Emojipack({
                isAnimated,
                name,
                author:exAuthor._id,
                emojis:[],
                summary,
                keyword,
                price,
                isFree,
                typicalEmoji:null,
                status:"decision in process",
            });
            await fs.mkdir(`emoji/${name}`,(err)=>{
                if(err){
                    next(err)
                }
            });
            await emojiFiles.map(async(emojiFile,i)=>{
                const ext = await emojiFile.originalname.split('.')[1];
                const emoji = await new Emoji({
                    emojiPack:exEmojipack._id,
                    png512:`emoji/${name}/${i+1}.${ext}`,
                    number: i+1,
                });
                emoji.save();
                await exEmojipack.emojis.push(emoji._id);
                if(i==0){
                    exEmojipack.typicalEmoji = emoji._id;
                }
                fs.rename(emojiFile.path,`emoji/${name}/${i+1}.${ext}`,(err)=>{
                    if(err){
                        next(err)
                    }
                });
            });
            await exAuthor.emojipacks.push(exEmojipack._id)
            await Author.updateOne({_id:exAuthor._id},{emojipacks:exAuthor.emojipacks});
            await exEmojipack.save();
            res.sendStatus(201);
        }else{
            res.sendStatus(204); //No Content
        }
        
    }catch(error){
        next(error)
    }
});
//해당 작가가 보유한 이모티콘 목록
router.get('/emojipacklist',auth.authenticate(),async(req,res,next)=>{
    try{
        const emojipacklist = await Emojipack.find({author:req.user._id});
        res.status(200).json(emojipacklist);
    }catch(error){
        next(error);
    }
});
//특정 이모티콘 페이지
router.get('emojipack/:id',auth.authenticate(),async(req,res,next)=>{
    try{
        const exAuthor = Author.findOne({user:req.user._id});
        const exEmojipack = await Emojipack.findOne({_id:req.params.id});
        const modificationreqs = await Modificationreq.find({emojipack:exEmojipack._id}).sort({data_created: -1});
        if(!exEmojipack){ //해당 이모티콘이 없을 경우
            res.sendStatus(204);
        }else if(exEmojipack.auth !== exAuthor._id){ //해당 이모티콘이 작가 본인의 작품이 아닐 경우
            res.sendStatus(203);
        }else if(exEmojipack.status == "return"){ //반려된 이모티콘일 결우 사유도 함께 첨부하여 전송
            //사유 관련 디비 만들고 사유 출력
        }else{ 
            res.status(200).json({exEmojipack:exEmojipack, modificationreq:modificationreqs[0]});
        }   
    }catch(error){
        next(error);
    }
});

//반려된것(+반려사유) 재제안 put /proposal/:name


//재 제출
//patch /proposal/:
router.patch('.proposal/:id',auth.authenticate(),async(req,res,next)=>{
    const { isAnimated , name , tag , price , summary } = req.body;
    try{
        const exAuthor = Author.findOne({user:req.user._id});
        const exEmojipack = await Emojipack.findOne({_id:req.params.id});
        if(!exEmojipack){ //해당 이모티콘이 없을 경우
            res.sendStatus(204);
        }else if(exEmojipack.auth !== exAuthor._id){ //해당 이모티콘이 작가 본인의 작품이 아닐 경우
            res.sendStatus(203);
        }else{
            exEmojipack.isAnimated = isAnimated;
            exEmojipack.name = name;
            exEmojipack.price = price;
            exEmojipack.summary = summary;
            exEmojipack.save();
            res.sendStatus(200);
        }
    }catch(error){

    }
})



module.exports = router;
