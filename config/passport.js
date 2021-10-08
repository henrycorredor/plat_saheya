const config = require('.')

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecret
}

module.exports = (passport) => {
    passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
        return done(false, { id: jwt_payload.id, rol: jwt_payload.rol })
    }))
}