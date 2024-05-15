const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TopicSchema = new Schema({
    topicName: {
        type: String,
        require: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    owner: {
        type: String,
        require: true
    }, // username in Account
    total: {
        type: Number,
        default: 0
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Topic', TopicSchema)