require('dotenv').config()
const AppStateManager = require('./app/managers/AppStateManager')
const KeyboardManager = require('./app/managers/KeyboardManager')
const TelegramBotApi = require('node-telegram-bot-api')
const RemoveService = require('./app/srvices/RemoveService')
const NoticeService = require('./app/srvices/NoticeService')
const NoteService = require('./app/srvices/NoteService')
const TodoService = require('./app/srvices/TodoService')
const NoticerApi = require('./app/NoticerApi')
const BotApi = require('./app/BotApi')
const Bot = require('./app/Bot')


process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})


const noticerApi = new NoticerApi(process.env.NOTICER_API_URL)
const appStateManager= new AppStateManager()

const bot = new Bot(
    new TelegramBotApi(process.env.TG_BOT_TOKEN, {polling: true}),
    new KeyboardManager(),
    new RemoveService(noticerApi),
    new NoticeService(noticerApi, appStateManager),
    new NoteService(noticerApi, appStateManager),
    new TodoService(noticerApi, appStateManager),
    appStateManager,
    process.env.CHAT_ID,
)

new BotApi(bot)