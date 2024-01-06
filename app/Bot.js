module.exports =  class Bot {
    constructor(bot, noticerApi, appStateManager, messageBuilder, allowedUserName) {
        this.allowedUserName = allowedUserName
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
        const { from, text, chat } = msg
        this.chatId = chat.id

        if (from.username !== this.allowedUserName) {
            return this.sendMessage('You\'re not welcome here.')
        }

        if (this.appStateManager.getInProgressRemoving()) {
            return this.handleRemoving(text)
        }

        return this.handleCommand(text)
    }

    handleRemoving = async (command) => {
        if (Number(command) % 1) {
            this.sendMessage('Error: incorrect number entered')
        } else {
            const entityId = this.appStateManager.getMapEntitiesNumberToId()[command]

            if (!entityId) {
                return this.sendMessage('Error: incorrect number entered')
            }

            this.noticerApi.post('delete' + this.appStateManager.getEntityTypeInProgressRemoving(), {'id': entityId})
                .then(() => {
                    this.sendMessage('Success')
                    this.appStateManager.reset()
                })
                .catch(async err => await this.sendMessage(err))
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
        return this.sendMessageMd(await this.getNotesMessage())
    }

    sendNotices = async () => {
        return this.sendMessageMd(await this.getNoticesMessage())
    }

    sendAllNotices = async () => {
        return this.sendMessageMd(await this.getAllNoticesMessage())
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
            return this.sendMessageMd('*🤷🏻‍♂️ There are no notes 🤷🏻‍♂️*')
        }

        this.appStateManager.setMapEntitiesNumberToId(notes.map(item => item.id))
        const messageWithNumberedNotes = this.messageBuilder.build('notes', notes)

        return this.sendMessageMd(messageWithNumberedNotes)
    }

    sendTodos = async () => {
        return this.sendMessageMd(await this.getTodosMessage())
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
            .catch(async err => await this.sendMessage(err))
    }

    showKeyboard = async () => {
        this.sendMessage('Bot menu', {
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
        this.sendMessage('Menu is closed', {
            reply_markup: {
                remove_keyboard: true
            }
        })
    }

    sendMessage = (text, options) => {
        return this.bot.sendMessage(this.chatId, text, options)
    }

    sendMessageMd = (text) => {
        return this.bot.sendMessage(this.chatId, text, { parse_mode: 'MarkdownV2' })
    }
}
