const TelegramBotApi = require('node-telegram-bot-api')
const NoticerApi = require('./NoticerApi')
const MessageBuilder = require('./MessageBuilder')


class Bot {
    constructor() {
        this.bot = new TelegramBotApi(process.env.TG_BOT_TOKEN, { polling: true })

        this.bot.setMyCommands(this.getMyCommands())
        this.bot.on('message', msg => this.messageHandler(msg))
    }

    getMyCommands = () => {
        return [
            { command: '/notes', description: 'Show notes' },
            { command: '/notices', description: 'Show notices' },
            { command: '/todos', description: `Show todos` },
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
            case 'Notes':
                return this.sendNotes(chatId)
            case '/notices':
            case 'Notices':
                return this.sendNotices(chatId)
            case '/todos':
            case 'Todos':
                return this.sendTodos(chatId)
            case '/allNotices':
            case 'All notices':
                return this.sendAllNotices(chatId)
            case '/start':
            case '/menu':
                return this.showKeyboard(chatId)
            case 'Close':
                return this.closeKeyboard(chatId)
            default:
                return this.addNewNote(chatId, command)
        }
    }

    sendNotes = async (chatId) => {
        return this.bot.sendMessage(chatId, await this.getNotesMessage(), {parse_mode: 'MarkdownV2'})
    }

    sendNotices = async (chatId) => {
        return this.bot.sendMessage(chatId, await this.getNoticesMessage(), {parse_mode: 'MarkdownV2'})
    }

    sendAllNotices = async (chatId) => {
        return this.bot.sendMessage(chatId, await this.getAllNoticesMessage(), {parse_mode: 'MarkdownV2'})
    }

    sendTodos = async (chatId) => {
        return this.bot.sendMessage(chatId, await this.getTodosMessage(), {parse_mode: 'MarkdownV2'})
    }

    getNotesMessage = async () => {
        return MessageBuilder.build('notes', await NoticerApi.get('getNotes'))
    }

    getNoticesMessage = async () => {
        return MessageBuilder.build('notices', await NoticerApi.get('getCurrentNotices'))
    }

    getAllNoticesMessage = async () => {
        return MessageBuilder.build('allNotices', await NoticerApi.get('getAllNotices'))
    }

    getTodosMessage = async () => {
        return MessageBuilder.build('todos', await NoticerApi.get('getTodos'))
    }

    addNewNote = (chatId, message) => {
        NoticerApi.post('addNewNote', { message })
            .catch(async err => await this.bot.sendMessage(chatId, err))
    }

    showKeyboard = async (chatId) => {
        this.bot.sendMessage(chatId, `Bot menu`, {
            reply_markup: {
                keyboard: [
                    ['Notes', 'Notices', 'Todos'],
                    ['All notices'],
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