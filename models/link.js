// app/models/link.js

var mongoose = require('mongoose');

var linkSchema = mongoose.Schema({
    // original link
    ol: {
        type: String,
        required: true
    },
    // short link
    sl: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Link', linkSchema);
