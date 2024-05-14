const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FolderSchema = new Schema({
    folderName: String,
    accountId: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Folder', FolderSchema)