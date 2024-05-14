const express = require('express')
const Router = express.Router()

const Controller = require('../controllers/Topic')

Router.get('/:user', Controller.get_topics)

Router.post('/add', Controller.add_topic)

Router.delete('/delete/:topicId', Controller.delete_topic)

Router.patch('/rename/:topicId', Controller.rename_topic)

Router.post('/:topicId/borrow-topic/:user', Controller.add_topic_to_user)

Router.delete('/:topicId/remove-topic/:user', Controller.remove_topic_from_user)

Router.get('/:topicId/words', Controller.get_words_from_topic)

Router.post('/:topicId/add-words', Controller.add_words_to_topic)

Router.delete('/remove-word/:wordId', Controller.remove_word_from_topic)

Router.patch('/adjust-word/:wordId', Controller.adjust_word_in_topic)

Router.patch('/update-progress-words/', Controller.update_progress_words_in_topic)

module.exports = Router