const express = require('express');
const router = express.Router();
const Author = require('../schemas/author');
const Emojipack = require('../schemas/emojipack');
const Emoji = require('../schemas/emoji');
const auth = require('../middlewares/auth')();
const User = require('../schemas/user');
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

//반려사유생성하기
router.post('/modificationreq/new',async(req,res,next)=>{
    const { message, emojipack_id } = req.body;
    try{
        const exEmojipack = await Emojipack.findOne({_id:emojipack_id});
        if(exEmojipack){
            const newModificationreq = new Modificationreq({
                emojipack:exEmojipack._id,
                message
            });
            newModificationreq.save();
            res.sendStatus(201);
        }
        else{
            res.sendStatus(202);
        }
    }catch(error){
        next(error);
    }
});


//언어추가
router.post('/language',async(req,res,next)=>{
    const {language} = req.body;
    try{
        const exLanguage = await Language.findOne({name:language});
        if(exLanguage){
            res.sendStatus(202);
        }else{
            const newLanguage = new Language({
                name:language
            });
            newLanguage.save();
            res.sendStatus(201);
        }
    }catch(error){
        next(error);
    }
})
//번역요청
router.post('/translate/:id',auth.authenticate(),async(req,res,next)=>{
    const { reqList } = req.body;
    const emojipack_id = req.params.id;
    try{
        const exEmojipack = await Emojipack.findOne({_id:emojipack_id});
        let languages=[];
        let language;
        await Promise.all(reqList.map(async(req,i)=>{
            language= await Language.findOne({name:req});
            console.log(language);
            languages.push(language._id); 
        }))
        console.log(languages);
        var exTranslate_req = await new Translate_req({
            emojipack:exEmojipack._id,
            languages
        });
        await exTranslate_req.save();
        res.sendStatus(201);  
    }catch(error){
        next(error);
    }
})

//새로운 이모티콘팩 등록
router.post('/proposal/new',auth.authenticate(),upload.array('emoji', 30),async(req,res,next)=>{ 
    const { isAnimated , name , keyword , price , summary, language,emojiCount } = req.body;
    const emojiFiles = req.files;
    let isFree = true;
    try{
        const exAuthor = await Author.findOne({user:req.user._id});
        const exLanguage = Language.findOne({name:language});
        const notNew = await Emojipack.findOne({name});
        if(parseFloat(price)){
            isFree = false;
            console.log(price);
        }
        if(notNew){
            emojiFiles.map((file,index)=>{
                fs.unlink(file.path, function(err){
                    if( err ) throw err;
                    console.log('file deleted');
                });
            })
            res.sendStatus(204);
        }
        else{
            const exEmojipack = new Emojipack({
                isAnimated,
                emojiCount,
                name,
                author:exAuthor._id,
                language:exLanguage._id,
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
            await Promise.all(emojiFiles.map(async(emojiFile,i)=>{
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
            }));
            await exAuthor.emojipacks.push(exEmojipack._id);
            await Author.updateOne({_id:exAuthor._id},{emojipacks:exAuthor.emojipacks});
            await exEmojipack.save();
            
            res.sendStatus(201);
        }
    }catch(error){
        next(error)
    }
});

//해당 작가가 보유한 이모티콘 목록
router.get('/emojipacklist',auth.authenticate(),async(req,res,next)=>{
    try{
        const exUser = await User.findOne({_id:req.user._id})
        const emojipacklist = await Emojipack.find({author:exUser.author});
        res.status(200).json(emojipacklist);
    }catch(error){
        next(error);
    }
});

//특정 이모티콘 페이지
router.get('/emojipack/:id',auth.authenticate(),async(req,res,next)=>{
    try{
        const exAuthor = await Author.findOne({user:req.user._id});
        const exEmojipack = await Emojipack.findOne({_id:req.params.id});
        
        console.log(exEmojipack.author,exAuthor._id)
        if(!exEmojipack){ //해당 이모티콘이 없을 경우
            res.sendStatus(204);
        }else if(!exEmojipack.author.equals(exAuthor._id)){ //해당 이모티콘이 작가 본인의 작품이 아닐 경우
            res.sendStatus(203);
        }else if(exEmojipack.status == "return"){ //반려된 이모티콘일 결우 사유도 함께 첨부하여 전송
            const modificationreqs = await Modificationreq.find({emojipack:exEmojipack._id}).sort({data_created: -1});
            console.log(modificationreqs[0]);
            res.status(200).json({exEmojipack, modificationreq:modificationreqs[0]});
        }else if(exEmojipack.status == "decision in process" || exEmojipack.status == "checking modification"){ 
            res.status(200).json(exEmojipack.status);
        }else if(exEmojipack.status == 'complete'){
            console.log(modificationreqs[0]);
            res.status(200).json(exEmojipack);
        }   
    }catch(error){
        next(error);
    }
});

//반려된것 다시 제안하기-> 반려된 제안 삭제하기 & 새로운 이모티콘 팩 등록

//반려된 제안 삭제하기
router.delete('/emojipack/:id',auth.authenticate(),async(req,res,next)=>{
    try{
        const exAuthor = await Author.findOne({user:req.user._id});
        const exEmojipack = await Emojipack.findOne({_id:req.params.id,author:exAuthor._id});
        if(!exEmojipack){
            res.sendStatus(202);
        }else{
            //작가의 DB에서 삭제
            await Promise.all(exAuthor.emojipacks.map(async(emojipack,index)=>{
                console.log("작가의 DB에서 삭제",emojipack,exEmojipack._id)
                if(emojipack.equals(exEmojipack._id)){
                    await exAuthor.emojipacks.splice(index,1);
                }
            }));
            await exAuthor.save();
            //Emojipack의 emoji DB에서 삭제 && 파일자체 삭제
            await Promise.all(exEmojipack.emojis.map(async(emoji,index)=>{
                let exEmoji = await Emoji.findById(emoji);
                fs.unlink(exEmoji.png512, function(err){
                    if( err ) throw err;
                    console.log('file deleted');
                });
                await Emoji.findByIdAndDelete(emoji);
            }));
            //빈폴더 삭제
            fs.rmdirSync(`emoji/${exEmojipack.name}`);

            await Translate_req.findOneAndRemove({emojipack:exEmojipack._id});
            //Emojipack 삭제
            await Emojipack.findByIdAndRemove(req.params.id);
            res.sendStatus(200);
        }
    }catch(error){
        next(error);
    }
});

//이모티콘 상태-반려로 전환 return
router.patch('/emojipack/:id/return',async(req,res,next)=>{
    try{
        const exEmojipack = await Emojipack.findOneAndUpdate({_id:req.params.id},{status:'return'});
        if(!exEmojipack){
            res.sendStatus(202);
        }else{
            res.sendStatus(200);
        }
    }catch(error){
        next(error);
    }
});

//이모티콘 상태-통과로 전환 complete
router.patch('/emojipack/:id/complete',async(req,res,next)=>{
    try{
        const exEmojipack = await Emojipack.findOneAndUpdate({_id:req.params.id},{status:'complete'});
        if(!exEmojipack){
            res.sendStatus(202);
        }else{
            res.sendStatus(200);
        }
    }catch(error){
        next(error);
    }
});

//이모티콘 상태-수정확인중으로 전환 checking modification
router.patch('/emojipack/:id/checkingmodification',async(req,res,next)=>{
    try{
        const exEmojipack = await Emojipack.findOneAndUpdate({_id:req.params.id},{status:'checking modification'});
        if(!exEmojipack){
            res.sendStatus(202);
        }else{
            res.sendStatus(200);
        }
    }catch(error){
        next(error);
    }
});



module.exports = router;
