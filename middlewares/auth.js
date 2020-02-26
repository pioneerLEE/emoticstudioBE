const passport = require('passport');
const passportJWT = require('passport-jwt');
const User = require('../schemas/user');
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

        const [exUser] = await User.find({_id:payload._id});
        if(exUser){
            return done(null,{ _id : exUser._id });
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