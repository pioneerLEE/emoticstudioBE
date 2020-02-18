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
const Translate_req = require('../schemas/translate_req');
const Language = require('../schemas/language');
const Paypal = require('../schemas/paypal');

require('dotenv').config();

const upload = multer({
    dest: "emoji/"
})


//새로운 이모티콘팩 등록
router.post('/proposal/new',auth.authenticate(),upload.array('emoji', 30),async(req,res,next)=>{ 
    const { isAnimated , name , keyword , price , summary, language,emojiCount,isReqTrans,reqList } = req.body;
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
                emojiCount,
                name,
                author:exAuthor._id,
                //language:exLanguage._id,
                emojis:[],
                summary,
                keyword,
                price,
                isFree,
                isReqTrans,
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
                let emoji = await new Emoji({
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
            /*if(isReqTrans){
                //language 탐색
                //해당 language들을 포함한 translate_req 생성
                let languageList = [];
                await reqList.map(async(req,i)=>{
                    let lang = await Language.findOne({name:req});
                    languageList.push(lang._id);
                });
                const exTranslate_req = new Translate_req({
                    emojipack:exEmojipack._id,
                    languages:languageList
                })
            }*/
            await exAuthor.emojipacks.push(exEmojipack._id)
            await Author.updateOne({_id:exAuthor._id},{emojipacks:exAuthor.emojipacks});
            await exEmojipack.save();
            //await exTranslate_req.save();
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
router.get('/emojipack/:id',auth.authenticate(),async(req,res,next)=>{
    try{
        const exAuthor = Author.findOne({user:req.user._id});
        const exEmojipack = await Emojipack.findOne({_id:req.params.id});
        
        if(!exEmojipack){ //해당 이모티콘이 없을 경우
            res.sendStatus(204);
        }else if(exEmojipack.auth !== exAuthor._id){ //해당 이모티콘이 작가 본인의 작품이 아닐 경우
            res.sendStatus(203);
        }else if(exEmojipack.status == "return"){ //반려된 이모티콘일 결우 사유도 함께 첨부하여 전송
            const modificationreqs = await Modificationreq.find({emojipack:exEmojipack._id}).sort({data_created: -1});
            res.status(200).json({exEmojipack, modificationreq:modificationreqs[0]});
        }else{ 
            if(exEmojipack.status == 'complete'){
                res.status(200).json({exEmojipack});
            }
        }   
    }catch(error){
        next(error);
    }
});

//반려된것 다시 제안하기
router.patch('/proposal/:id',auth.authenticate(),async(req,res,next)=>{
    const { isAnimated , name , keyword , price , summary, language,emojiCount,isReqTrans,reqList } = req.body;
    try{
        const exAuthor = Author.findOne({user:req.user._id});
        const exEmojipack = await Emojipack.findOne({_id:req.params.id});
        const exLanguage = await Language.findOne({name:language});

        if(!isReqTrans){
            await Translate_req.findOneAndRemove({emojipack:exEmojipack._id});
        }
        const exTranslate_req = await Translate_req.findOne({emojipack:exEmojipack._id});
        if(!exEmojipack){ //해당 이모티콘이 없을 경우
            res.sendStatus(204);
        }else if(exEmojipack.auth !== exAuthor._id){ //해당 이모티콘이 작가 본인의 작품이 아닐 경우
            res.sendStatus(203);
        }else{
            exEmojipack.isAnimated = isAnimated;
            exEmojipack.name = name;
            exEmojipack.price = price;
            exEmojipack.summary = summary;
            exEmojipack.keyword = keyword;
            exEmojipack.language = exLanguage._id,
            exEmojipack.emojiCount = emojiCount,
            exEmojipack.isReqTrans = isReqTrans,
            exEmojipack.status = "checking modification"

            await exEmojipack.save();

            if(isReqTrans){
                let languageList = [];
                await reqList.map(async(reqlang,i)=>{
                    let lang = await Language.findOne({name:reqlang});
                    languageList.push(lang._id);
                });
                exTranslate_req.languages = languageList;
                await exTranslate_req.save();
            }
            res.sendStatus(200);
        }
    }catch(error){

    }
});

//반려된 제안 삭제하기
router.delete('/proposla/:id',auth.authenticate(),async(req,res,next)=>{

});



module.exports = router;
