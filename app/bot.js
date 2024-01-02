const TelegramBotApi = require('node-telegram-bot-api')
const axios = require('axios')
const noticerApiUrl = process.env.NOTICER_API_URL

const getMyCommands = () => {
    return [
        { command: '/notes', description: 'Получить все заметки' }
    ]
}

const makeNotes = (notes) => {
    const label = 'Заметки\n\n'
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

const messageHandler = async (msg, bot) => {
    const message = msg.text
    const chatId = msg.chat.id

    if (message === '/notes') {
        bot.sendMessage(chatId, await getNotes())
    } else {
        axios.post(`${noticerApiUrl}/addNewNote`, { message: msg.text })
            .catch(err => bot.sendMessage(msg.chat.id, err.message))
    }
}

const createBot = () => {
    const bot = new TelegramBotApi(process.env.TG_BOT_TOKEN, { polling: true })

    bot.setMyCommands(getMyCommands())
    bot.on('message',  msg => messageHandler(msg, bot))

    return bot
}

module.exports = createBot
