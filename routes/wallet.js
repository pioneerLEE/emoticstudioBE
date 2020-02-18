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
        const exWallet = Wallet.findOne({owner:req.user._id});
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
        const newAccount = new Account({
            owner:req.user._id,
            bank:exBank._id,
            number,
        });
        await newAccount.save();
        res.json(201);
    }catch(error){
        next(error);
    }
});

//계좌로 출금 신청하기
router.post('/account/:id/withdraw',auth.authenticate(),async(req,res,next)=>{
    const { money } = req.body;
    try{
        const exReq = await Withdraw_req.find({account:req.params.id}).sort({data_created: -1});
        //신규 출금 신청일 경우
        if(!exReq || exReq[0].status == 'complete'){
            const newWithdraw_req = new Withdraw_req({
                money: money,
                account: req.params.id,
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
        const newPaypal = new Paypal({
            owner:req.user._id,
            email:email,
        });
        await newPaypal.save();
        res.json(201);
    }catch(error){
        next(error);
    }
});






module.exports = router;
