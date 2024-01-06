require('dotenv').config()
const MessageBuilder = require('./app/MessageBuilder')
const TelegramBotApi = require('node-telegram-bot-api')
const NoticerApi = require('./app/NoticerApi.js')
const BotApi = require('./app/BotApi')
const Utils = require('./app/Utils')
const AppStateManager = require('./app/AppStateManager')
const Bot = require('./app/Bot')


const messageBuilder = new MessageBuilder(new Utils)
const bot = new Bot(
    new TelegramBotApi(process.env.TG_BOT_TOKEN, { polling: true }),
    new NoticerApi(process.env.NOTICER_API_URL),
    new AppStateManager,
    messageBuilder,
    process.env.TG_USERNAME
)

new BotApi(bot.bot, messageBuilder)
