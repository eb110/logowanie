const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')


require('../models/mongoose')
const User = require('../models/user')

const initializePassport = require('../passport.config')
initializePassport(
    passport, 
       //this is getUserByEmail function in passport-config.js file
    async email => {
        console.log('email serwer: ' + email)
        const listUsers = await User.find({})
        const check = listUsers.find(x => x.email === email)
        return check
    }
)
router.get('/', (req, res) => {
    res.render('index.ejs', {ja: 'eb110'})
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