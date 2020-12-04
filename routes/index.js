const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const session = require('express-session')
const methodOverride = require('method-override')

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
router.use(methodOverride('_method'))

router.get('/', checkAuthenticated, async (req, res) => {
    const nazwa = await req.user
    res.render('index.ejs', {
        nameIndex: nazwa.userName,
        statusIndex: nazwa.status
    })
})

router.get('/login', checkNotAuthenticated, (req, res) => {
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

router.post('/register', checkNotAuthenticated, async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const newUser = new User({
            userName: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            status: req.body.status
        })
        await newUser.save()
        res.redirect('/login')
    } catch {
        console.log('this is error')
        res.redirect('/register')
    }
})

router.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})


//this will avoid the ability to visit pages without authentication
function checkAuthenticated(req, res, next){
    //because of passport we can use isAuthenticated function
    //this function has to be applied to the routing page
    if(req.isAuthenticated()) {
        //if user logged then go next
        return next()
    }
    //if not redirect
    res.redirect('/login')
    }
    
    //function to avoid double login
    function checkNotAuthenticated(req, res, next){
        if(req.isAuthenticated()){
            return res.redirect('/')
        }
        //next just stays your browsing as it is
        next()
    }

module.exports = router