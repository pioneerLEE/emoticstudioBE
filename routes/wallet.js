const express = require('express');
const router = express.Router();
const Author = require('../schemas/author');
const auth = require('../middlewares/auth')();
const Account = require('../schemas/account');
const Bank = require('../schemas/bank');
const Paypal = require('../schemas/paypal');
const Withdraw_req = require('../schemas/withdraw_req');

require('dotenv').config();

//누적수익&현재보유수익
router.get('/wallet',auth.authenticate(),async(req,res,next)=>{
    try{
        const exWallet = await Wallet.findOne({owner:req.user._id});
        res.sendStatus(200).json(exWallet);
    }catch(error){
        next(error);
    }
});

//계좌 등록
router.post('/account/new',auth.authenticate(),async(req,res,next)=>{
    const { bank, number } = req.body;
    try{
        const exBank = Bank.findOne({name:bank});
        const exAccount = await Account.findOne({owner:req.user._id});
        if(exAccount){
            res.sendStatus(202);
        }
        else{
            const newAccount = new Account({
                owner:req.user._id,
                bank:exBank._id,
                number,
            });
            newAccount.save();
            res.json(newAccount);
        }
        
    }catch(error){
        next(error);
    }
});

//계좌 수정
router.patch('/account/:id',auth.authenticate(),async(req,res,next)=>{
    const { bank, number } = req.body;
    try{
        const exBank = await Bank.findOne({name:bank});
        const exAccount = await Account.updateOne({_id:req.params.id},{bank:exBank._id,number});
        res.json(exAccount);
    }catch(error){
        next(error);
    }
});

//출금 신청하기
router.post('/withdraw',auth.authenticate(),async(req,res,next)=>{
    const { way } = req.body;
    try{
        const exReq = await Withdraw_req.find({account:req.params.id}).sort('-data_created');
        console.log(exReq[0]);
        //신규 출금 신청일 경우
        if(!exReq[0]){
            const newWithdraw_req = new Withdraw_req({
                user:req.user._id,
                status:"waiting",
                way
            });
            await newWithdraw_req.save();
            res.sendStatus(201);
        }else if(exReq[0].status == 'complete'){
            const newWithdraw_req = new Withdraw_req({
                user:req.user._id,
                status:"waiting",
                way
            });
            await newWithdraw_req.save();
            res.sendStatus(201);
        }else{ //기존 완료안된 출금신청이 있을 경우
            res.sendStatus(202);
        }
    }catch(error){
        next(error);
    }
});


//paypal 등록
router.post('/paypal/new',auth.authenticate(),async(req,res,next)=>{
    const { email } = req.body;
    try{
        const exPaypal = await Paypal.findOne({owner:req.user._id});
        if(exPaypal){
            res.sendStatus(202);
        }else{
            const newPaypal = new Paypal({
                owner:req.user._id,
                email:email,
            });
            await newPaypal.save();
            res.json(newPaypal);
        }
        
    }catch(error){
        next(error);
    }
});

//paypal 수정
router.patch('/paypal/:id',auth.authenticate(),async(req,res,next)=>{
    const { email } = req.body;
    try{
        const exPaypal = await Paypal.updateOne({_id:req.params.id},{email:email});
        res.json(exPaypal);
    }catch(error){
        next(error);
    }
});

//은행추가하기
router.post('/bank/new',async(req,res,next)=>{
    const { name } = req.body;
    try{
        const exBank = await Bank.findOne({name});
        console.log(exBank);
        if(exBank){
            res.sendStatus(202);
        }else{
            const newBank = new Bank({
                name:name
            });
            await newBank.save();
            res.sendStatus(201);
        }
    }catch(error){
        next(error);
    }
});



module.exports = router;
