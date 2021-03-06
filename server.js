const express = require('express')
const app = express()

const flash = require('express-flash')
//const session = require('express-session')
//const passport = require('passport')

require('./models/mongoose')

const indexRouter = require('./routes/index')

app.use(express.urlencoded({ extended: false}))
app.use(flash())

//passport function initialization
//app.use(passport.initialize())
//initialize session to store our variables to be persisted
//across entire session the user has
//app.use(passport.session())
app.set('view-engine', 'ejs')
app.set('views', __dirname + '/views')
app.use(express.static('public'))

app.use('/', indexRouter)

app.listen(process.env.PORT || 3000, () => {
    console.log('router fired up !!! yay :-)')
})