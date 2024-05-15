const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HistorySchema = new Schema({
    accountId: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        require: true
    },
    topicId: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        require: true
    },
    mode: {
        type: String,
        enum: ['flashcard', 'quiz', 'type'],
        require: true
    },
    total: {
        type: Number,
        require: true
    },
    correct: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('History', HistorySchema)