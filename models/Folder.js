const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FolderSchema = new Schema({
    folderName: {
        type: String,
        require: true
    },
    accountId: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        require: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Folder', FolderSchema)