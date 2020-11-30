const express = require('express')
const app = express()

require('./models/mongoose')

const indexRouter = require('./routes/index')

app.use(express.urlencoded({ extended: false}))
app.set('view-engine', 'ejs')
app.set('views', __dirname + '/views')
app.use(express.static('public'))

app.use('/', indexRouter)

app.listen(3000)