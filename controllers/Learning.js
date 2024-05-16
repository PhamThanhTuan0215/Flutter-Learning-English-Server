const { default: mongoose } = require('mongoose')
const History = require('../models/History')
const Account = require('../models/Account')

module.exports.save_history = (req, res) => {
    const { accountId, topicId, mode, total, correct, duration } = req.body

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
        return res.json({ code: 1, message: 'Invalid account ID' })
    }

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.json({ code: 1, message: 'Invalid topic ID' })
    }

    if (!mode || !total || !duration) {
        return res.json({ code: 1, message: 'Please provide full information (mode, total, duration)' })
    }

    const newHistory = new History({
        accountId, topicId, mode, total, correct, duration
    })

    newHistory.save()
        .then(history => {
            return res.json({ code: 0, message: 'Save history successfully', history })
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Save history failed' })
        })
}

module.exports.most_correct_answers_topic = (req, res) => {
    const { topicId } = req.params

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.json({ code: 1, message: 'Invalid topic ID' })
    }

    // top 5 most correct
    History.aggregate([
        { $match: { topicId: new mongoose.Types.ObjectId(topicId) } },
        {
            $sort: {
                correct: -1,
                createAt: 1
            }
        },
        { $limit: 5 }
    ])
        .then(async result => {
            
            var accountIds = []
            for (const item of result) {

                if(!accountIds.includes(item.accountId.toString())) {
                    accountIds.push(item.accountId.toString())
                }
            }

            if (accountIds.length === 0) {
                return res.json({ code: 1, message: 'This topic has not been researched' })
            }

            try {
                const users = await Promise.all(
                    accountIds.map(accountId =>
                        Account.findById(accountId).select('-email -password -role').exec()
                    )
                );
                return res.json({ code: 0, users })
            } catch (err) {
                return res.json({ code: 1, message: 'Fetching users failed' })
            }
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Search most correct answers topic failed', error: err });
        });
}

module.exports.shortest_time_complete_topic = (req, res) => {
    const { topicId } = req.params

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.json({ code: 1, message: 'Invalid topic ID' })
    }

    // top 5 shorstest
    History.aggregate([
        {
            $match: {
                topicId: new mongoose.Types.ObjectId(topicId),
                $expr: { $eq: ["$total", "$correct"] }
            }
        },
        {
            $group: {
                _id: "$accountId",
                duration: { $min: "$duration" },
                records: { $push: "$$ROOT" }
            }
        },
        { $sort: { duration: 1 } },
        { $limit: 5 }
    ])
        .then(async result => {
            if (result.length === 0) {
                return res.json({ code: 1, message: 'This topic does not have user achieving 100% accuracy' })
            }

            const accountIds = result.map(r => r._id)
            try {
                const users = await Promise.all(
                    accountIds.map(accountId =>
                        Account.findById(accountId).select('-email -password -role').exec()
                    )
                );
                return res.json({ code: 0, users })
            } catch (err) {
                return res.json({ code: 1, message: 'Fetching users failed' })
            }
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Search shortest time complete topic failed' })
        });
}

module.exports.most_times_topic = (req, res) => {
    const { topicId } = req.params

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.json({ code: 1, message: 'Invalid topic ID' })
    }

    // top 5 most times
    History.aggregate([
        { $match: { topicId: new mongoose.Types.ObjectId(topicId) } },
        { $group: { _id: "$accountId", count: { $sum: 1 }, records: { $push: "$$ROOT" } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ])
        .then(async result => {
            if (result.length === 0) {
                return res.json({ code: 1, message: 'This topic has not been researched' })
            }

            const accountIds = result.map(r => r._id)
            try {
                const users = await Promise.all(
                    accountIds.map(accountId =>
                        Account.findById(accountId).select('-email -password -role').exec()
                    )
                )
                return res.json({ code: 0, users })
            } catch (err) {
                return res.json({ code: 1, message: 'Fetching users failed' })
            }
        })
        .catch(err => {
            return res.json({ code: 1, message: 'Search most times study topic failed' });
        })
}