const TelegramBotApi = require('node-telegram-bot-api')
const NoticerApi = require('./NoticerApi')
const Utils = require('./Utils')


class Bot {
    constructor() {
        this.bot = new TelegramBotApi(process.env.TG_BOT_TOKEN, { polling: true })

        this.bot.setMyCommands(this.getMyCommands())
        this.bot.on('message', msg => this.messageHandler(msg))
    }

    getMyCommands = () => {
        return [
            { command: '/notes', description: 'Get all notes' },
            { command: '/notices', description: 'Get all notices' },
            { command: '/todos', description: `Get all todos` },
            { command: '/menu', description: 'Menu' },
        ]
    }

    messageHandler = (msg) => {
        const { text, chat } = msg
        const chatId = chat.id

        return this.handleCommand(chatId, text)
    }

    handleCommand = async (chatId, command) => {
        switch (command) {
            case '/notes':
            case 'Get notes':
                return this.showNotes(chatId)
            case '/notices':
            case 'Get notices':
                return this.sendNotices(chatId)
            case '/todos':
            case 'Get todos':
                return this.sendTodos(chatId)
            case '/start':
            case '/menu':
                return this.showKeyboard(chatId)
            case 'Close':
                return this.closeKeyboard(chatId)
            default:
                return this.addNewNote(chatId, command)
        }
    }

    showNotes = async (chatId) => {
        return this.bot.sendMessage(chatId, await this.getNotesMessage(), {parse_mode: 'MarkdownV2'})
    }

    sendNotices = async (chatId) => {
        return this.bot.sendMessage(chatId, await this.getNoticesMessage(), {parse_mode: 'MarkdownV2'})
    }

    sendTodos = async (chatId) => {
        return this.bot.sendMessage(chatId, await this.getTodosMessage(), {parse_mode: 'MarkdownV2'})
    }

    getNotesMessage = async () => {
        return this.makeNotes(await NoticerApi.get('getNotes'))
    }

    getNoticesMessage = async () => {
        return this.makeNotices(await NoticerApi.get('getAllNotices'))
    }

    getTodosMessage = async () => {
        return this.makeTodos(await NoticerApi.get('getTodos'))
    }

    makeNotes = (notes) => {
        if (!notes.length) {
            return '* 🤷🏻‍♂️There are no notes 🤷🏻‍♂️*'
        }

        const label = '*Notes*\n\n'
        let notesMessage = ''

        for (let i = 0; i < notes.length; i++) {
            let num = i + 1
            notesMessage += `*${num}\\.* ${Utils.escapeMarkdown(notes[i].text)}\n\n`
        }

        return label + notesMessage
    }

    makeNotices = (notices) => {
        if (!notices.length) {
            return '*🤷🏻‍♂️ There are no notices 🤷🏻‍♂️*'
        }

        const label = '*Notices*\n\n'
        let noticesMessage = ''

        for (let notice of notices) {
            noticesMessage += `>${Utils.escapeMarkdown(notice.datetime)}\n${notice.text}\n\n`
        }

        return label + noticesMessage
    }

    makeTodos = (todos) => {
        if (!todos.length) {
            return '*🤷🏻‍♂️ There are no todos 🤷🏻‍♂️*'
        }

        const label = `*Todos*\n\n`
        let todosMessage = ''

        for (let todo of todos) {
            todosMessage += `${todo.is_completed ? '✔️ ' : '✖️ '} ${Utils.escapeMarkdown(todo.text)} \n\n`
        }

        return label + todosMessage
    }

    addNewNote = (chatId, message) => {
        NoticerApi.post('addNewNote', { message })
            .catch(async err => await this.bot.sendMessage(chatId, err))
    }

    showKeyboard = async (chatId) => {
        this.bot.sendMessage(chatId, `Bot menu`, {
            reply_markup: {
                keyboard: [
                    ['Get notes', 'Get notices', 'Get todos'],
                    ['Close'],
                ],
                resize_keyboard: true
            }
        })
    }

    closeKeyboard = async (chatId) => {
        this.bot.sendMessage(chatId, 'Menu is closed', {
            reply_markup: {
                remove_keyboard: true
            }
        })
    }
}


module.exports = new Bot()