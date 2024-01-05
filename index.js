require('dotenv').config()
const Bot = require('./app/Bot')
const BotApi = require('./app/BotApi')


new BotApi(Bot.bot)
