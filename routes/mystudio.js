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

require('dotenv').config();

const upload = multer({
    dest: "emoji/"
})

//isAnimated , name , tag , price , summary , emoji 28개
//새로운것 post /proposal/new

router.post('/proposal/new',auth.authenticate(),upload.array('emoji', 30),async(req,res,next)=>{  //태그 관련 내용 정리 필요 //가격 체계 정리 필요
    const { isAnimated , name , tag , price , summary } = req.body;
    const emojiFiles = req.files;
    try{
        const exAuthor = await Author.findOne({_id:req.user._id});
        
        const exEmojipack = new Emojipack({
            isAnimated: true,
            name,
            author:req.user._id,
            emojis:[],
            summary
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
            fs.rename(emojiFile.path,`emoji/${name}/${i}.${ext}`,(err)=>{
                if(err){
                    next(err)
                }
            });
        });
        await exAuthor.emojipacks.push(exEmojipack._id)
        await Author.updateOne({_id:exAuthor._id},{emojipacks:exAuthor.emojipacks});
        await exEmojipack.save();
        res.send(201);
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





//반려된것(+반려사유) 재제안 put /proposal/:name

//patch /proposal/:name

module.exports = router;
