module.exports =  class Bot {
    constructor(bot, noticerApi, messageBuilder) {
        this.bot = bot
        this.noticerApi = noticerApi
        this.messageBuilder = messageBuilder

        this.bot.setMyCommands(this.getMyCommands())
        this.bot.on('message', msg => this.messageHandler(msg))
    }

    getMyCommands = () => {
        return [
            { command: '/notes', description: 'Show notes' },
            { command: '/notices', description: 'Show notices' },
            { command: '/todos', description: 'Show todos' },
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
        return this.messageBuilder.build('notes', await this.noticerApi.get('getNotes'))
    }

    getNoticesMessage = async () => {
        return this.messageBuilder.build('notices', await this.noticerApi.get('getCurrentNotices'))
    }

    getAllNoticesMessage = async () => {
        return this.messageBuilder.build('allNotices', await this.noticerApi.get('getAllNotices'))
    }

    getTodosMessage = async () => {
        return this.messageBuilder.build('todos', await this.noticerApi.get('getTodos'))
    }

    addNewNote = (chatId, message) => {
        this.noticerApi.post('addNewNote', { message })
            .catch(async err => await this.bot.sendMessage(chatId, err))
    }

    showKeyboard = async (chatId) => {
        this.bot.sendMessage(chatId, 'Bot menu', {
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
