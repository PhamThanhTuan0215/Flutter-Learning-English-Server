const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TopicSchema = new Schema({
    topicName: String,
    isPublic: Boolean,
    owner: String, // username in Account
    createAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Topic', TopicSchema)