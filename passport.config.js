const LocalStrategy = require('passport-local').Strategy

function initialize(passport){
    //it will make sure the user is correct
    const authenticateUser = (email, password, done) => {

    }
    passport.use(new LocalStrategy({ usernameField: 'email'}), 
    authenticateUser)

    passport.serializeUser((user, done) => {})
    passport.deserializeUser((id, done) => {})
}