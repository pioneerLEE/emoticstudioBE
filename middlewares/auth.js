const passport = require('passport');
const passportJWT = require('passport-jwt');
const Author = require('../schemas/author');
const cfg = require('../jwt_config');
const ExtractJwt = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;
const params = {
    secretOrKey: cfg.jwtSecret,
    // header { key: 'Authorization', value: 'JWT' + 토큰 }
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

module.exports = function(){
    const strategy = new Strategy(params,async(payload, done)=>{

        const user = await Author.find({_id:payload._id});
        if(user){
            return done(null,{ id : user._id });
        }else{
            return done(new Error('User not found'), null);
        }
    });
    passport.use(strategy);
    return {
        initialize: function () {
            return passport.initialize();
        },
        authenticate: function () {
            return passport.authenticate('jwt', cfg.jwtSession);
        }
    };
}