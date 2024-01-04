const TelegramBotApi = require('node-telegram-bot-api')
const axios = require('axios')
const noticerApiUrl = process.env.NOTICER_API_URL

const getMyCommands = () => {
    return [
        { command: '/notes', description: 'Получить все заметки' },
        { command: '/notices', description: 'Получить все напоминалки' },
        { command: '/todos', description: `Получить все todo'шки` },
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

function escapeMarkdown(text) {
    return text.replace(/[_*[\]()~`>#+-=|{}.!]/g, "\\$&");
}

const makeNotices = (notices) => {
    const label = '*Напоминалки*\n\n'
    let noticesMessage = '';

    for (let notice of notices) {
        noticesMessage += '>' + escapeMarkdown(notice.datetime) + '\n' + notice.text + '\n\n'
    }

    return label + noticesMessage
}

const makeTodos = (todos) => {
    const label = `*Todo's*\n\n`
    let notesMessage = '';

    for (let todo of todos) {
        if (todo.is_completed) {
            notesMessage += '✔️ '
        } else {
            notesMessage += '✖️ '
        }

        notesMessage += todo.text + '\n\n'
    }

    return label + notesMessage
}

const getNotes = async () => {
    const notes = await axios.get(`${noticerApiUrl}/getNotes`)
        .then(response => response.data.data)
        .catch(err => err.message)

    return makeNotes(notes)
}

const getNotices = async () => {
    const notices = await axios.get(`${noticerApiUrl}/getAllNotices`)
        .then(response => response.data.data)
        .catch(err => err.message)

    return makeNotices(notices)
}

const getTodos = async () => {
    const todos = await axios.get(`${noticerApiUrl}/getTodos`)
        .then(response => response.data.data)
        .catch(err => err.message)

    return makeTodos(todos)
}

const showNotes = async (bot, chatId) => {
    return bot.sendMessage(chatId, await getNotes(), {parse_mode: "MarkdownV2"})
}
const showNotices = async (bot, chatId) => {
    await getNotices()
    return bot.sendMessage(chatId, await getNotices(), {parse_mode: "MarkdownV2"})
}
const showTodos = async (bot, chatId) => {
    return bot.sendMessage(chatId, await getTodos(), {parse_mode: "MarkdownV2"})
}

const showKeyboard = async (bot, chatId) => {
    bot.sendMessage(chatId, `Меню бота`, {
        reply_markup: {
            keyboard: [
                ['Get notes', 'Get notices', 'Get todos'],
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
        case '/notices':
        case 'Get notices':
            return showNotices(bot, chatId)
        case '/todos':
        case 'Get todos':
            return showTodos(bot, chatId)
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
