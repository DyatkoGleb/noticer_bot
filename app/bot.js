const TelegramBotApi = require('node-telegram-bot-api')
const axios = require('axios')
const noticerApiUrl = process.env.NOTICER_API_URL

const getMyCommands = () => {
    return [
        { command: '/notes', description: 'Получить все заметки' },
        { command: '/menu', description: 'Меню' },
    ]
}

const makeNotes = (notes) => {
    const label = '*Заметки*\n\n'
    let notesMessage = '';

    for (let note of notes) {
        notesMessage += note.text + '\n\n'
    }

    return label + notesMessage
}

const getNotes = async () => {
    const notes = await axios.get(`${noticerApiUrl}/getNotes`)
        .then(response => response.data.data)
        .catch(err => err.message)

    return makeNotes(notes)
}

const showNotes = async (bot, chatId) => {
    return bot.sendMessage(chatId, await getNotes())
}

const showKeyboard = async (bot, chatId) => {
    bot.sendMessage(chatId, `Меню бота`, {
        reply_markup: {
            keyboard: [
                ['Get notes'],
                ['Close'],
            ],
            resize_keyboard: true
        }
    })
}

const closeKeyboard = async (bot, chatId) => {
    bot.sendMessage(chatId, 'Меню закрыто', {
        reply_markup: {
            remove_keyboard: true
        }
    })
}

const addNewNote = (bot, chatId, message) => {
    axios.post(`${noticerApiUrl}/addNewNote`, { message })
        .catch(async err => await bot.sendMessage(chatId, err.message))
}

const messageHandler = (msg, bot) => {
    const message = msg.text
    const chatId = msg.chat.id

    switch (message) {
        case '/notes':
        case 'Get notes':
            return showNotes(bot, chatId)
        case '/start':
        case '/menu':
            return showKeyboard(bot, chatId)
        case 'Close':
            return closeKeyboard(bot, chatId)
        default:
            return addNewNote(bot, chatId, message)
    }
}

const createBot = () => {
    const bot = new TelegramBotApi(process.env.TG_BOT_TOKEN, { polling: true })

    bot.setMyCommands(getMyCommands())
    bot.on('message', msg => messageHandler(msg, bot))

    return bot
}

module.exports = createBot
