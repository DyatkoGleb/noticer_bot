require('dotenv').config()
const Bot = require('./app/Bot')
const createApi = require('./app/api')

createApi(Bot.bot)