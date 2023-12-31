require('dotenv').config()
const createBot = require('./app/bot')
const createApi = require('./app/api')

const bot = createBot()
createApi(bot)