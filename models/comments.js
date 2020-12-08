const mongoose = require('mongoose');
const Comment = new mongoose.Schema({
    commentTimestamp:{
        type: Date,
        required: true
    },
    commentAuthor: {
        type: String,
        required: true
    },
    commentComment: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Comment', Comment)