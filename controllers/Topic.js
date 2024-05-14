const { default: mongoose } = require('mongoose')
const Topic = require('../models/Topic')
const AccountTopic = require('../models/AccountTopic')
const FolderTopic = require('../models/FolderTopic')
const Word = require('../models/Word')

module.exports.get_topics = (req, res) => {

    const { user } = req.params

    if (!user) {
        return res.json({ code: 1, message: 'Please provide user' })
    }

    AccountTopic.find({ user })
        .then(accountTopics => {

            const topicIds = accountTopics.map(at => at.topicId)

            return Topic.find({ _id: { $in: topicIds } })
        })
        .then(topics => {
            return res.json({ code: 0, topics })
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Search topics failed' })
        });
}

module.exports.add_topic = (req, res) => {
    const { topicName, isPublic, owner } = req.body

    if (!topicName || !owner) {
        return res.json({ code: 1, message: 'Please provide full information (topic name, owner)' })
    }

    const newTopic = new Topic({
        topicName, isPublic, owner
    })

    newTopic.save()
        .then(topic => {
            let newAccountTopic = AccountTopic({
                user: owner,
                topicId: topic._id
            })
            newAccountTopic.save()

            return res.json({ code: 0, message: 'Add topic successfully', topic })
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Add topic failed' })
        })
}

module.exports.delete_topic = (req, res) => {
    const { topicId } = req.params

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.json({ code: 1, message: 'Invalid topic ID' })
    }

    Topic.findByIdAndDelete(topicId)
        .then(topic => {
            if (!topic) {
                return res.json({ code: 1, message: 'Topic not found' })
            }

            Promise.all([
                AccountTopic.deleteMany({ topicId: topicId }),
                FolderTopic.deleteMany({ topicId: topicId }),
                Word.deleteMany({ topicId: topicId })
            ])

            return res.json({ code: 0, message: 'Delete topic successfully', topic })
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Delete topic failed' })
        })
}

module.exports.rename_topic = (req, res) => {
    const { topicId } = req.params
    const { topicName } = req.body

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.json({ code: 1, message: 'Invalid topic ID' })
    }

    if (!topicName) {
        return res.json({ code: 1, message: 'Please provide topic name' })
    }

    Topic.findByIdAndUpdate(topicId, { topicName: topicName }, { new: true })
        .then(updatedTopic => {
            if (!updatedTopic) {
                return res.json({ code: 1, message: 'Topic not found' })
            }
            return res.json({ code: 0, message: 'Rename topic successfully', updatedTopic })
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Rename topic failed' })
        })
}

module.exports.add_topic_to_user = (req, res) => {
    const { topicId, user } = req.params

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.json({ code: 1, message: 'Invalid topic ID' })
    }

    if(!user) {
        return res.json({ code: 1, message: 'Please provide user' })
    }

    const newAccountTopic = AccountTopic({
        user: user,
        topicId: topicId
    })

    newAccountTopic.save()
        .then(accountTopic => {
            return res.json({ code: 0, message: 'Add topic to user successfully' })
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Add topic to user failed' })
        })
}

module.exports.remove_topic_from_user = (req, res) => {
    const { topicId, user } = req.params

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.json({ code: 1, message: 'Invalid topic ID' })
    }

    if(!user) {
        return res.json({ code: 1, message: 'Please provide user' })
    }

    AccountTopic.findOneAndDelete({user, topicId})
        .then(accountTopic => {
            if (!accountTopic) {
                return res.json({ code: 1, message: 'User does not contain topic' })
            }

            return res.json({ code: 0, message: "Remove topic from user successfully" })
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Remove topic from user failed' })
        })
}

module.exports.get_words_from_topic = (req, res) => {

    const { topicId } = req.params

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.json({ code: 1, message: 'Invalid topic ID' })
    }

    Word.find({ topicId })
        .then(listWord => {
            return res.json({ code: 0, listWord })
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Search words failed' })
        })
}

module.exports.add_words_to_topic = (req, res) => {
    const { topicId } = req.params
    const { listWord } = req.body

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.json({ code: 1, message: 'Invalid topic ID' })
    }

    if (!listWord) {
        return res.json({ code: 1, message: 'Please provide words' })
    }

    const words = listWord.map(word => {
        const { english, vietnamese, description } = word

        return {
            topicId: topicId,
            english: english,
            vietnamese: vietnamese,
            description: description,
        }
    })

    Topic.findById(topicId)
        .then(topic => {
            Word.insertMany(words)
                .then(() => {
                    return res.json({ code: 1, message: 'Add words to topic successfully' })
                })
                .catch(err => {
                    return res.json({ code: 1, message: 'Add words to topic failed' })
                })
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Topic not found' })
        })
}

module.exports.remove_word_from_topic = (req, res) => {
    const { wordId } = req.params

    if (!mongoose.Types.ObjectId.isValid(wordId)) {
        return res.json({ code: 1, message: 'Invalid word ID' })
    }

    Word.findByIdAndDelete(wordId)
        .then(word => {
            if (!word) {
                return res.json({ code: 1, message: 'Word not found' })
            }

            return res.json({ code: 0, message: "Remove word from topic successfully" })
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Remove word from topic failed' })
        })
}

module.exports.adjust_word_in_topic = (req, res) => {
    const { wordId } = req.params
    const { english, vietnamese, description, isStarred } = req.body

    if (!mongoose.Types.ObjectId.isValid(wordId)) {
        return res.json({ code: 1, message: 'Invalid word ID' })
    }

    if (!english || !vietnamese) {
        return res.json({ code: 1, message: 'Please provide full information (english , vietnamese)' })
    }

    Word.findByIdAndUpdate(wordId,
        { english, vietnamese, description, isStarred }
        , { new: true })
        .then(word => {
            if (!word) {
                return res.json({ code: 1, message: 'Word not found' })
            }

            return res.json({ code: 0, message: 'Adjust word successfully', word })
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Adjust word failed' })
        })
}

module.exports.update_progress_words_in_topic = (req, res) => {

    const { listWord } = req.body

    if (!listWord) {
        return res.json({ code: 1, message: 'Please provide words' })
    }

    const bulkOperations = listWord.map(word => ({
        updateOne: {
            filter: { _id: word._id },
            update: {
                english: word.english,
                vietnamese: word.vietnamese,
                description: word.description,
                isStarred: word.isStarred,
                numberCorrect: word.numberCorrect,
                status: updateStatusWord(word.numberCorrect)
            }
        }
    }))

    Word.bulkWrite(bulkOperations)
        .then(() => {
            return res.json({ code: 0, message: 'Update progress words successfully' })
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Update progress words failed' })
        })
}

function updateStatusWord(numberCorrect) {
    if (numberCorrect <= 0) {
        return 'not learned'
    }
    if (numberCorrect <= 3) {
        return 'currently learning'
    }
    return 'mastered'
}