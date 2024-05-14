const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FolderTopicSchema = new Schema({
    folderId: {
        type: Schema.Types.ObjectId,
        ref: 'Folder'
    },
    topicId: {
        type: Schema.Types.ObjectId,
        ref: 'Topic'
    },
})

module.exports = mongoose.model('FolderTopic', FolderTopicSchema)