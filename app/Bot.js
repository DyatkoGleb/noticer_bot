module.exports =  class Bot {
    constructor (
        bot,
        keyboardManager,
        noticeService,
        noteService,
        todoService,
        appStateManager,
        allowedChatId
    ) {
        this.keyboardManager = keyboardManager
        this.appStateManager = appStateManager
        this.allowedChatId = allowedChatId
        this.noticeService = noticeService
        this.noteService = noteService
        this.todoService = todoService
        this.bot = bot

        this.serviceMap = {
            'Note': this.noteService,
            'Notice': this.noticeService,
            'Todo': this.todoService,
        }

        this.bot.setMyCommands(this.getCommands())
        this.bot.on('message', msg => this.messageHandler(msg))
    }

    getCommands = () => {
        return [
            { command: '/menu', description: 'Menu' },
            { command: '/notes', description: 'Show notes' },
            { command: '/notices', description: 'Show notices' },
            { command: '/todos', description: 'Show todos' },
            { command: '/allnotices', description: 'Show all notices' },
            { command: '/addnote', description: 'Add new note' },
            { command: '/addnotice', description: 'Add new notice' },
            { command: '/addtodo', description: 'Add new todo' },
            { command: '/removenote', description: 'Remove note' },
            { command: '/removenotice', description: 'Remove notice' },
            { command: '/removetodo', description: 'Remove todo' },
        ]
    }

    messageHandler = (msg) => {
        const { text, chat } = msg
        this.chatId = chat.id

        if (Number(this.chatId) !== Number(this.allowedChatId)) {
            return this.sendMessage('You\'re not welcome here.')
        }

        if (this.appStateManager.getEntityTypeInProgressRemoving()) {
            return this.handleRemoving(text)
        } else if (this.appStateManager.getEntityTypeInProgressAdding()) {
            return this.handleAdding(text)
        }

        return this.handleCommand(text)
    }

    handleRemoving = async (command) => {
        if (!Number.isInteger(Number(command))) {
            return this.sendMessage('Error: incorrect number entered')
        }

        if (Number(command) === 0) {
            this.sendMessage(`End of ${this.appStateManager.getEntityTypeInProgressRemoving().toLowerCase()} removing`)
            return this.appStateManager.reset()
        }

        const entityId = this.appStateManager.getMapEntitiesNumberToId()[command]

        if (!entityId) {
            return this.sendMessage('Error: incorrect number entered')
        }

        try {
            await this.appStateManager.getServiceInProcessing().remove(this.appStateManager.getEntityTypeInProgressRemoving(), entityId)
            this.appStateManager.removeFieldFromMapEntitiesNumberToId(command)

            if (!Object.keys(this.appStateManager.getMapEntitiesNumberToId()).length) {
                this.sendMessage(`End of ${this.appStateManager.getEntityTypeInProgressRemoving().toLowerCase()} removing`)
                return this.appStateManager.reset()
            }

            this.sendMessage('Success')
        } catch (error) {
            this.sendMessage(error)
        }
    }

    handleAdding = (text) => {
        if (Number(text) === 0) {
            this.sendMessage(`End of ${this.appStateManager.getEntityTypeInProgressAdding().toLowerCase()} adding`)
            return this.appStateManager.reset()
        }

        try {
            if (this.appStateManager.getEntityTypeInProgressAdding() === 'Notice' && !this.noticeService.isValidMessage(text)) {
                return this.sendMessage('Error: incorrect message, it should be look like:\n01.19.2024 00:01 Happy Birthday')
            }

            this.todoService.addNew(text, this.appStateManager.getEntityTypeInProgressAdding().toLowerCase())

            return this.appStateManager.reset()
        } catch (error) {
            this.sendMessage(error)
        }
    }

    handleCommand = (command) => {
        return this.getCommandHandler(command)()
    }

    getCommandHandler = (command) => {
        const commandHandlers = {
            '/notes': this.sendNotes,
            'Notes': this.sendNotes,
            '/notices': this.sendNotices,
            'Notices': this.sendNotices,
            '/todos': this.sendTodos,
            'Todos': this.sendTodos,
            '/allNotices': () => this.sendNotices(true),
            '<- All': () => this.sendNotices(true),
            'Add note': () => this.addEntityAction('Note'),
            '/addnote': () => this.addEntityAction('Note'),
            'Add notice': () => this.addEntityAction('Notice'),
            '/addnotice': () => this.addEntityAction('Notice'),
            'Add todo':() => this.addEntityAction('Todo'),
            '/addtodo':() => this.addEntityAction('Todo'),
            'Remove note': () => this.removeEntityAction('Note'),
            '/removenote': () => this.removeEntityAction('Note'),
            'Remove notice': () => this.removeEntityAction('Notice'),
            '/removenotice': () => this.removeEntityAction('Notice'),
            'Remove todo': () => this.removeEntityAction('Todo'),
            '/removetodo': () => this.removeEntityAction('Todo'),
            '/start': this.showKeyboard,
            '/menu': this.showKeyboard,
            'Close': this.closeKeyboard,
        }

        return commandHandlers[command] || (() => this.noteService.addNew(command))
    }

    sendNotes = async () => {
        return this.sendMessageMd(await this.noteService.getEntityMessage())
    }

    sendNotices = async (all) => {
        return this.sendMessageMd(await this.noticeService.getEntityMessage(null, false, all))
    }

    sendTodos = async () => {
        return this.sendMessageMd(await this.todoService.getEntityMessage())
    }

    addEntityAction = (entityType) => {
        this.appStateManager.setEntityTypeInProgressAdding(entityType)
        this.appStateManager.setServiceInProcessing(this.serviceMap[entityType])

        return this.sendMessageMd(this.appStateManager.getServiceInProcessing().getHintToAddNew())
    }

    removeEntityAction = async (entityType) => {
        this.appStateManager.setEntityTypeInProgressRemoving(entityType)
        this.appStateManager.setServiceInProcessing(this.serviceMap[entityType])

        return this.sendMessageMd(await this.appStateManager.getServiceInProcessing().removeAction())
    }

    showKeyboard = async () => {
        this.sendMessage('Bot menu', this.keyboardManager.showKeyboard())
    }

    closeKeyboard = async () => {
        this.sendMessage('Menu is closed', this.keyboardManager.closeKeyboard())
    }

    sendMessage = (text, options) => {
        return this.bot.sendMessage(this.chatId, text, options)
    }

    sendMessageMd = (text, chatId) => {
        return this.bot.sendMessage(chatId ?? this.chatId, text, { parse_mode: 'MarkdownV2' })
    }
}
