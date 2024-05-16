const express = require('express')
const Router = express.Router()

const Controller = require('../controllers/Learning')

Router.post('/save-history', Controller.save_history)

Router.get('/most-correct-answers-topic/:topicId', Controller.most_correct_answers_topic)

Router.get('/shorstest-time-topic/:topicId', Controller.shortest_time_complete_topic)

Router.get('/most-times-topic/:topicId', Controller.most_times_topic)

module.exports = Router