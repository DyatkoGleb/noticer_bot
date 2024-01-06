const AppStateManager = require("./AppStateManager");
module.exports =  class Bot {
    constructor(bot, noticerApi, appStateManager, messageBuilder) {
        this.appStateManager = appStateManager
        this.messageBuilder = messageBuilder
        this.noticerApi = noticerApi
        this.bot = bot

        this.chatId = null

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
        this.chatId = chat.id

        if (this.appStateManager.getInProgressRemoving()) {
            return this.handleRemoving(text)
        }

        return this.handleCommand(text)
    }

    handleRemoving = async (command) => {
        if (Number(command) % 1) {
            this.bot.sendMessage(this.chatId, 'Error: incorrect number entered', { parse_mode: 'MarkdownV2' })
        } else {
            const entityId = this.appStateManager.getMapEntitiesNumberToId()[command]

            if (!entityId) {
                return this.bot.sendMessage(this.chatId, 'Error: incorrect number entered', { parse_mode: 'MarkdownV2' })
            }

            this.noticerApi.post('delete' + this.appStateManager.getEntityTypeInProgressRemoving(), {'id': entityId})
                .then(() => {
                    this.bot.sendMessage(this.chatId, 'Success', { parse_mode: 'MarkdownV2' })
                    this.appStateManager.reset()
                })
                .catch(async err => await this.bot.sendMessage(this.chatId, err))
        }
    }

    handleCommand = (command) => {
        switch (command) {
            case '/notes':
            case 'Notes':
                return this.sendNotes()
            case '/notices':
            case 'Notices':
                return this.sendNotices()
            case '/todos':
            case 'Todos':
                return this.sendTodos()
            case '/allNotices':
            case 'All notices':
                return this.sendAllNotices()
            case 'Remove note':
                return this.removeEntity('Note')
            case '/start':
            case '/menu':
                return this.showKeyboard()
            case 'Close':
                return this.closeKeyboard()
            default:
                return this.addNewNote(command)
        }
    }

    sendNotes = async () => {
        return this.bot.sendMessage(this.chatId, await this.getNotesMessage(), { parse_mode: 'MarkdownV2' })
    }

    sendNotices = async () => {
        return this.bot.sendMessage(this.chatId, await this.getNoticesMessage(), { parse_mode: 'MarkdownV2' })
    }

    sendAllNotices = async () => {
        return this.bot.sendMessage(this.chatId, await this.getAllNoticesMessage(), { parse_mode: 'MarkdownV2' })
    }

    removeEntity = async (entityType) => {
        this.appStateManager.setEntityTypeInProgressRemoving(entityType)
        this.appStateManager.setInProgressRemoving(true)

        switch (entityType) {
            case 'Note':
                return this.removeNote()
        }
    }

    removeNote = async () => {
        const notes = await this.noticerApi.get('getNotes')

        if (!notes.length) {
            this.appStateManager.reset()
            return this.bot.sendMessage(this.chatId, '*🤷🏻‍♂️ There are no notes 🤷🏻‍♂️*', { parse_mode: 'MarkdownV2' })
        }

        this.appStateManager.setMapEntitiesNumberToId(notes.map(item => item.id))
        const messageWithNumberedNotes = this.messageBuilder.build('notes', notes)

        return this.bot.sendMessage(this.chatId, messageWithNumberedNotes, { parse_mode: 'MarkdownV2' })
    }

    sendTodos = async () => {
        return this.bot.sendMessage(this.chatId, await this.getTodosMessage(), { parse_mode: 'MarkdownV2' })
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

    addNewNote = (message) => {
        this.noticerApi.post('addNewNote', { message })
            .catch(async err => await this.bot.sendMessage(this.chatId, err))
    }

    showKeyboard = async () => {
        this.bot.sendMessage(this.chatId, 'Bot menu', {
            reply_markup: {
                keyboard: [
                    ['Notes', 'Notices', 'Todos'],
                    ['All notices'],
                    ['Remove note'],
                    ['Close'],
                ],
                resize_keyboard: true
            }
        })
    }

    closeKeyboard = async () => {
        this.bot.sendMessage(this.chatId, 'Menu is closed', {
            reply_markup: {
                remove_keyboard: true
            }
        })
    }
}
