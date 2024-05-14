const mongoose = require('mongoose')
const Schema = mongoose.Schema

const WordSchema = new Schema({
    topicId: {
        type: Schema.Types.ObjectId,
        ref: 'Topic'
    },
    english: String,
    vietnamese: String,
    description: String,
    isStarred: {
        type: Boolean,
        default: false
    },
    numberCorrect: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: 'not learned' // not learned,  currently learning, mastered
    }
})

module.exports = mongoose.model('Word', WordSchema)