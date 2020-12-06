/*we have to initiate mongoose as we are going to use
its method 'model'*/
const mongoose = require('mongoose')
//model
const TicketNr = new mongoose.Schema({
    BugTicketNumber:{
        type: Number,
        required: true
}})

/*we have to export our function as 
we want to use it*/

module.exports = mongoose.model('TicketNr', TicketNr)