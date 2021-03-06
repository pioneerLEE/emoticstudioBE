const mongoose = require('mongoose');

module.exports = () =>{
    const connect = ()=>{
        if (process.env.NODE_ENV !== 'production') {
            mongoose.set('debug', true);
        }
        mongoose.connect('mongodb://root@localhost:27017/admin',{
            dbName:'emoticstudio'
        },(error)=>{
            if(error){
                console.log('몽고디비 연결 에러',error);
            }else{
                console.log('몽고디비 연결 성공');
            }
        });
    };
    connect();
    mongoose.connection.on('error',(error)=>{
        console.error('몽고디비 연결 에러',error);
    });
    mongoose.connection.on('disconnected',()=>{
        console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.')
    });
    require('./account');
    require('./bank');
    require('./user');
    require('./author');
    require('./normaluser');
    require('./company')
    require('./service')
    require('./emojipack');
    require('./emoji');
    require('./tag');
    require('./visitinfo');
    require('./wallet');
    require('./translate_req');
    require('./country');
    require('./modificationreq');
    require('./language');
    require('./paypal');
    require('./wallet');
    require('./countrycount');
    require('./agecount');
    require('./withdraw_req');
    require('./newlist');
}

