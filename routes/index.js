const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const session = require('express-session')
//const cookieParser = require('cookie-parser');
const methodOverride = require('method-override')

//let MemoryStore = require('session-memory-store')(express)
//router.use(cookieParser());

let listUsers = []
let TicketNumber = 0
let listTickets = []
let indeks = 0
let listComments = []

const MongoDBStore = require('connect-mongodb-session')(session);
const store1 = new MongoDBStore({
    uri : 'mongodb+srv://eb110:fhekjrs343Df@cluster0-rnf08.mongodb.net/SSD?retryWrites=true&w=majority',
    collection: 'mySessions'
})

router.use(session({
    secret: 'a4f8071f-c873-4447-8ee2',
    cookie: { maxAge: 2628000000 },
    store: store1,
    resave: true,
    saveUninitialized: true
}))



require('../models/mongoose')
const User = require('../models/user')
const TicketNr = require('../models/ticketNr')
const Ticket = require('../models/ticket')
const Comment = require('../models/comments')

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

router.get('/comments', checkAuthenticated, async (req, res) => {
    listComments = await Comment.find({})
    listTickets = await Ticket.find({})
    let commentsTemp = listTickets[indeks].comments
    let wsad = []
    for(let i = 0; i < commentsTemp.length; i++){
        for(let j = 0; j < listComments.length; j++){
            if(commentsTemp[i] == listComments[j]._id.toString()){
                wsad.push(listComments[j])
                break
            }
        }
    }
    const nazwa = await req.user
    let data = new Date()
    try{
    res.render('comments.ejs', {
        Tcts: wsad,
        TDate: data,
        Author: nazwa.userName
    })
    }catch{
        console.log('cos kurwa nie gra')
    }
})

router.post('/comments', checkAuthenticated, async (req, res) => {
    const nazwa = await req.user
    if(listTickets[indeks].ticketStatus === 'Closed'){
        req.flash('error', 'Status is Closed - can\'t create a new one')
    }
    else{

    const newComment = await new Comment({
        commentTimestamp: new Date(),
        commentAuthor: nazwa.userName,
        commentComment: req.body.Comment
    })
    await newComment.save()  
    let komt = listTickets[indeks].comments
    komt.push(newComment._id)
    await Ticket.updateOne({
        ticketNumber: indeks + 1
    }, {
        $set: {
            comments: komt
        }
    }
    )
}
    listComments = await Comment.find({})
    let commentsTemp = listTickets[indeks].comments
    let wsad = []
    for(let i = 0; i < commentsTemp.length; i++){
        for(let j = 0; j < listComments.length; j++){
            if(commentsTemp[i] == listComments[j]._id.toString()){
                wsad.push(listComments[j])
                break
            }
        }
    }
    res.render('comments.ejs', {
        Tcts: wsad,
        TDate: new Date(),
        Author: nazwa.userName
    })
})

router.get('/open', checkAuthenticated, async(req, res) => {
    let check = req.query.a - 1
    if(!isNaN(check))indeks = check
    res.render('open.ejs', {Tcts: listTickets[indeks]})
})

router.post('/open', checkAuthenticated, async (req, res) => {
    const check = await req.body.Status
    try {
        await Ticket.updateOne({
            ticketNumber: indeks + 1
        }, {
            $set: {
                ticketStatus: check
            }
        }
        )
        listTickets[indeks].ticketStatus = check
    } catch {
        console.log('dupa ' + check)
    }
    res.render('open.ejs', { Tcts: listTickets[indeks] })
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
    listTickets = await Ticket.find({})
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
           ticketError: req.body.ErrorMSG,
           comments: []
        })
        await newTicket.save()  
        listTickets = await Ticket.find({})    
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