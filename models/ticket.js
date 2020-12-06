/*we have to initiate mongoose as we are going to use
its method 'model'*/
const mongoose = require('mongoose')
//model
const Ticket = new mongoose.Schema({
    ticketNumber:{
        type: Number,
        required: true
    },
    ticketTimestamp:{
        type: Date,
        required: true
    },
    ticketAuthor: {
        type: String,
        required: true
    },
    ticketStatus: {
        type: String,
        required: true
    },
    ticketType: {
        type: String,
        required: true
    },
    ticketDate: {
        type: Date,
        required: true
    },
    ticketAssignment: {
        type: String,
        required: true
    },
    ticketPriority: {
        type: String,
        required: true
    },
    ticketDescription: {
        type: String,
        required: true
    },
    ticketError: {
        type: String,
        required: true
    }   
})

/*we have to export our function as 
we want to use it*/

module.exports = mongoose.model('Ticket', Ticket)