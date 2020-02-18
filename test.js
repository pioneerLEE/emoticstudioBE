router.post('/proposal/new',auth.authenticate(),upload.array('emoji', 30),async(req,res,next)=>{ 
    const { isAnimated , name , keyword , price , summary, language,emojiCount,isReqTrans,reqList } = req.body;
    const emojiFiles = req.files;
    let isFree = true;
    try{
        const exAuthor = await Author.findOne({user:req.user._id});
        const exLanguage = await Language.findOne({name:language});
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
                language:exLanguage._id,
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
            if(isReqTrans){
                //language 탐색
                //해당 language들을 포함한 translate_req 생성
                let languageList = [];
                await reqList.map(async(reqlang,i)=>{
                    let lang = await Language.findOne({name:reqlang});
                    languageList.push(lang._id);
                });
                const exTranslate_req = new Translate_req({
                    emojipack:exEmojipack._id,
                    languages:languageList
                })
            }
            await exAuthor.emojipacks.push(exEmojipack._id)
            await Author.updateOne({_id:exAuthor._id},{emojipacks:exAuthor.emojipacks});
            await exEmojipack.save();
            await exTranslate_req.save();
            res.sendStatus(201);
        }else{
            res.sendStatus(204); //No Content
        }
    }catch(error){
        next(error)
    }
});