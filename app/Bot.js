const Message = require('./Message')
const MessageEntity = require('./MessageEntity')


module.exports =  class Bot {
    constructor (bot, noticerApi, appStateManager, allowedChatId) {
        this.appStateManager = appStateManager
        this.noticerApi = noticerApi
        this.allowedChatId = allowedChatId
        this.bot = bot

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

        if (this.chatId != this.allowedChatId) {
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
                return this.sendNotices(true)
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

    sendNotices = async (all) => {
        return this.sendMessageMd(await this.getNoticesMessage(all))
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
        const messageWithNumberedNotes = await this.getNotesMessage()

        return this.sendMessageMd(messageWithNumberedNotes)
    }

    sendTodos = async () => {
        return this.sendMessageMd(await this.getTodosMessage())
    }

    getNotesMessage = async () => {
        const notes = await this.noticerApi.get('getNotes')
        const message = new Message()

        message.setLabel('Notes')

        notes.forEach((note, idx) => {
            const messageEntity= new MessageEntity(note.text)
            messageEntity.setSequenceNumber(idx + 1)
            message.addEntity(messageEntity)
        })

        return message.getMessageText()
    }

    getNoticesMessage = async (all) => {
        const message = new Message()
        const notices = all
            ? await this.noticerApi.get('getAllNotices')
            : await this.noticerApi.get('getCurrentNotices')

        all ? message.setLabel('All notices') : message.setLabel('Notices')

        notices.forEach(notice => {
            const messageEntity = new MessageEntity(notice.text)
            messageEntity.setDate(notice.datetime)
            message.addEntity(messageEntity)
        })

        return message.getMessageText()
    }

    getTodosMessage = async () => {
        const todos = await this.noticerApi.get('getTodos')
        const message = new Message()

        message.setLabel('Todos')

        todos.forEach((todo, idx) => {
            const messageEntity= new MessageEntity(todo.text)
            messageEntity.setIsCompleted(todo.is_completed)
            message.addEntity(messageEntity)
        })

        return message.getMessageText()
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

    sendMessageMd = (text, chatId) => {
        return this.bot.sendMessage(chatId ?? this.chatId, text, { parse_mode: 'MarkdownV2' })
    }
}
