const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();
const User = require('../schemas/user');
const Company = require('../schemas/company');
const Service = require('../schemas/service');
const JWT = require("jsonwebtoken");
const auth = require('../middlewares/auth')();
const cfg = require('../jwt_config');
require('dotenv').config();



//새로운 서비스 등록 -> api key 생성
router.post('/service/new',auth.authenticate(),async(req,res,next)=>{
    const {name,consumer_age } = req.body;
    try{
        //const [addRoom] = await Room.find({_id:newRoom._id}).populate('creator')
        const api_key = JWT.sign({ _id : exUser._id }, cfg.apiSecret );
        const exUser = await User.findOne({_id:req.user._id});
        const service = new Service({
            name,
            api_key,
            consumer_age,
            company:exUser.company,
        });
        await service.save();
        res.status(201).json(service)
    }catch(error){
        next(error);
    }
});
//해당 회사에 등록된 서비스 목록 출력
router.get('/service/list',auth.authenticate(),async(req,res,next)=>{
    try{
        const exUser = await User.findOne({_id:req.user._id});
        const services = await Service.find({conpany:exUser.company});
        res.status(200).json(services);
    }catch(error){
        next(error);
    }
});
//특정 서비스 내용 출력
//서비스 내용 수정





module.exports = router;



