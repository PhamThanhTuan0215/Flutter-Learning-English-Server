const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AccountTopicSchema = new Schema({
    user: String,
    topicId: {
        type: Schema.Types.ObjectId,
        ref: 'Topic'
    },
})

module.exports = mongoose.model('AccountTopic', AccountTopicSchema)