const package = require("../middlewares/package.js");
const { default: mongoose } = require('mongoose')
const History = require('../models/History')
const Achievement = require('../models/Achievement')

module.exports.save_history = (req, res) => {
    const { username, topicId, mode, total, correct, duration } = req.body

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.json(package(1, 'Invalid topic ID', null))
    }

    if (!username || !mode || !total || !duration) {
        return res.json(package(1, 'Please provide full information (username, mode, total, duration)', null))
    }

    const newHistory = new History({
        username, topicId, mode, total, correct, duration
    })

    newHistory.save()
        .then(history => {

            Promise.all([
                (correct === total) ? updateUsersMostCorrect(topicId) : null,
                updateUsersShortestTime(topicId),
                updateUsersMostTimes(topicId)
            ])

            return res.json(package(0, 'Save history successfully', history))
            
        })
        .catch(err => {
            return res.json(package(1, 'Save history failed', null))
        })
}

module.exports.search_achievements_by_category = (req, res) => {
    const { topicId, category } = req.params

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.json(package(1, 'Invalid topic ID', null))
    }

    if (!category) {
        return res.json(package(1, 'Please provide category', null))
    }

    if(category !== 'corrects' && category !== 'duration' && category !== 'times') {
        return res.json(package(1, 'Category of achievement not found', null))
    }

    Achievement.find({ topicId, category }).sort({ rank: 1 })
        .then(achievements => {
            return res.json(package(0, 'Search achievements successfully', achievements))
        })
        .catch(err => {
            return res.json(package(1, 'Search achievements failed', err))
        })
}

module.exports.get_personal_achievements = (req, res) => {
    const { username } = req.params

    if (!username) {
        return res.json(package(1, 'Please provide username', null))
    }

    Achievement.find({ username })
        .then(achievements => {
            return res.json(package(0, 'Search achievements successfully', achievements))
        })
        .catch(err => {
            return res.json(package(1, 'Search achievements failed', err))
        })
}

function updateUsersMostCorrect(topicId) {
    History.aggregate([
        { $match: { topicId: new mongoose.Types.ObjectId(topicId) } },
        {
            $group: {
                _id: "$username",
                correct: { $max: "$correct" },
                records: { $push: { correct: "$correct", createAt: "$createAt" } }
            }
        },
        {
            $addFields: {
                createAt: {
                    $reduce: {
                        input: "$records",
                        initialValue: null,
                        in: {
                            $cond: {
                                if: { $eq: ["$$this.correct", "$correct"] },
                                then: "$$this.createAt",
                                else: "$$value"
                            }
                        }
                    }
                }
            }
        },
        { $sort: { correct: -1, createAt: 1 } },
        { $limit: 5 }
    ])
        .then(async results => {
            if (results.length !== 0) {

                var rank = 1
                var promises = []

                for (const result of results) {
                    const promise = Achievement.findOneAndUpdate(
                        { topicId: topicId, category: 'corrects', rank: rank },
                        { $set: { username: result._id, topicId: topicId, category: 'corrects', achievement: result.correct, rank: rank } },
                        { upsert: true, new: true }
                    ).exec()

                    promises.push(promise);
                    rank++;
                }

                Promise.all(promises)
                    .then(achievements => {
                        console.log('All achievements created or updated successfully')
                    })
                    .catch(err => {
                        console.log('Error creating or updating achievements:', err)
                    })
            }

        })
        .catch(err => {
            console.log('Update most correct answers topic failed', err)
        });
}

function updateUsersShortestTime(topicId) {
    History.aggregate([
        {
            $match: {
                topicId: new mongoose.Types.ObjectId(topicId),
                $expr: { $eq: ["$total", "$correct"] }
            }
        },
        {
            $group: {
                _id: "$username",
                duration: { $min: "$duration" },
                records: { $push: "$$ROOT" }
            }
        },
        { $sort: { duration: 1 } },
        { $limit: 5 }
    ])
        .then(async results => {
            if (results.length !== 0) {

                var rank = 1
                var promises = []

                for (const result of results) {
                    const promise = Achievement.findOneAndUpdate(
                        { topicId: topicId, category: 'duration', rank: rank },
                        { $set: { username: result._id, topicId: topicId, category: 'duration', achievement: result.duration, rank: rank } },
                        { upsert: true, new: true }
                    ).exec()

                    promises.push(promise);
                    rank++;
                }

                Promise.all(promises)
                    .then(achievements => {
                        console.log('All achievements created or updated successfully')
                    })
                    .catch(err => {
                        console.log('Error creating or updating achievements:', err)
                    })
            }
        })
        .catch(err => {
            console.log('Update shortest time complete topic failed', err)
        });
}

function updateUsersMostTimes(topicId) {
    History.aggregate([
        { $match: { topicId: new mongoose.Types.ObjectId(topicId) } },
        { $group: { _id: "$username", count: { $sum: 1 }, records: { $push: "$$ROOT" } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ])
        .then(async results => {
            if (results.length !== 0) {

                var rank = 1
                var promises = []

                for (const result of results) {
                    const promise = Achievement.findOneAndUpdate(
                        { topicId: topicId, category: 'times', rank: rank },
                        { $set: { username: result._id, topicId: topicId, category: 'times', achievement: result.count, rank: rank } },
                        { upsert: true, new: true }
                    ).exec()

                    promises.push(promise);
                    rank++;
                }

                Promise.all(promises)
                    .then(achievements => {
                        console.log('All achievements created or updated successfully')
                    })
                    .catch(err => {
                        console.log('Error creating or updating achievements:', err)
                    })
            }
        })
        .catch(err => {
            console.log('Update most times study topic failed', err)
        })
}