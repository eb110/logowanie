const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const session = require('express-session')
const methodOverride = require('method-override')

let listUsers = []
let TicketNumber = 0
let listTickets = []

router.use(session({
    //secret is a key which i encrypt all the information for us
    secret: 'dupa',
    resave: false,
    saveUninitialized: false
}))

require('../models/mongoose')
const User = require('../models/user')
const TicketNr = require('../models/ticketNr')
const Ticket = require('../models/ticket')

//hook up passport configuration
const initializePassport = require('../passport-config')
const initializeRegistration = require('../register-config')
//initialization
initializePassport(
    passport, 
       //this is getUserByEmail function in passport-config.js file
    async email => {
        listUsers = await User.find({})
        const check = listUsers.find(x => x.email === email)
        return check
    },
    //same stuff but for getUserById
    async id => {
        listUsers = await User.find({})
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

router.get('/open', checkAuthenticated, async(req, res) => {
    let check = req.query
    console.log(check)
    res.render('open.ejs')
})

router.get('/load', checkAuthenticated, async (req, res) => {
    res.render('load.ejs', {Tcts: listTickets})
})
router.post('/load', checkAuthenticated, async (req, res) => {
    res.render('open.ejs')
})

router.get('/login', checkNotAuthenticated, async (req, res) => {
    listTickets = await Ticket.find({})
    res.render('login.ejs')
})

router.get('/new', checkAuthenticated, async (req, res) => {
    const nazwa = await req.user
    let data = new Date()
    TicketNumber = await TicketNr.find({})
    TicketNumber = TicketNumber[0].BugTicketNumber + 1
    res.render('new.ejs', {
        TNr: TicketNumber,
        TDate: data,
        TUsers: listUsers,
        Author: nazwa.userName
    })
})

router.post('/new', checkAuthenticated, async(req, res) => {
    const nazwa = await req.user
    try{
        const newTicket = new Ticket({
           ticketNumber: TicketNumber,
           ticketTimestamp: new Date(),
           ticketAuthor: nazwa.userName,
           ticketStatus: 'Open',
           ticketType: req.body.Type,
           ticketDate: req.body.TicketDate,
           ticketAssignment: req.body.Assignment,
           ticketPriority: req.body.Priority,
           ticketDescription: req.body.Description,
           ticketError: req.body.ErrorMSG
        })
        await newTicket.save()      
        await TicketNr.updateOne({
            BugTicketNumber: TicketNumber - 1
        },{
            $set: {
                BugTicketNumber: TicketNumber
            }
        }
        )        
        res.redirect('/')        
    } catch {
        console.log('this is error')
        res.redirect('/new')
    }
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
    listUsers = await User.find({})
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const newUser = new User({
            userName: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            status: req.body.status
        })
        let initObject = initializeRegistration(listUsers, await newUser)
        if(initObject.status){
        await newUser.save()
        res.redirect('/login')
        }
        else {
            req.flash('error', initObject.message)
            res.redirect('/register')
        }
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