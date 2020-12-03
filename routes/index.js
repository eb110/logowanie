const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const session = require('express-session')

router.use(session({
    //secret is a key which i encrypt all the information for us
    secret: 'dupa',
    resave: false,
    saveUninitialized: false
}))

require('../models/mongoose')
const User = require('../models/user')

//hook up passport configuration
const initializePassport = require('../passport-config')
//initialization
initializePassport(
    passport, 
       //this is getUserByEmail function in passport-config.js file
    async email => {
        const listUsers = await User.find({})
        const check = listUsers.find(x => x.email === email)
        return check
    },
    //same stuff but for getUserById
    async id => {
        const listUsers = await User.find({})
        const check = listUsers.find(x => x.id === id)
        return check
    }
    //atm we have initialized our passport by user typed authentication
)

router.use(passport.initialize())
router.use(passport.session())

router.get('/', (req, res) => {
    res.render('index.ejs', {ja: req.newUser.name})
})

router.get('/login', (req, res) => {
    res.render('login.ejs')
})

//checkNotAuthenticated,
//we are going to use passport middleware
router.post('/login', passport.authenticate('local', {
    //we are going to modify it
    successRedirect: '/',
    failureRedirect: '/login',
    //we want to flash message
    failureFlash: true
}))

router.post('/register', async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const newUser = new User({
            userName: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        await newUser.save()
        res.redirect('/login')
    } catch {
        console.log('this is error')
        res.redirect('/register')
    }
})

router.get('/register', (req, res) => {
    res.render('register.ejs')
})

module.exports = router