const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')

const initializePassport = require('../passport.config')
//initializePassport(passport)

require('../models/mongoose')
const User = require('../models/user')

router.get('/', (req, res) => {
    res.render('index.ejs', {ja: 'eb110'})
})

router.get('/login', (req, res) => {
    res.render('login.ejs')
})

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