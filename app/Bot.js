module.exports =  class Bot {
    constructor (bot,
        keyboardManager,
        removeService,
        noticeService,
        noteService,
        todoService,
        appStateManager,
        allowedChatId
    ) {
        this.keyboardManager = keyboardManager
        this.appStateManager = appStateManager
        this.allowedChatId = allowedChatId
        this.removeService = removeService
        this.noticeService = noticeService
        this.noteService = noteService
        this.todoService = todoService
        this.bot = bot

        this.bot.setMyCommands(this.getCommands())
        this.bot.on('message', msg => this.messageHandler(msg))
    }

    getCommands = () => {
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

        if (Number(this.chatId) !== Number(this.allowedChatId)) {
            return this.sendMessage('You\'re not welcome here.')
        }

        if (this.appStateManager.getInProgressRemoving()) {
            return this.handleRemoving(text)
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
            await this.removeService.removeEntity(this.appStateManager.getEntityTypeInProgressRemoving(), entityId)
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
            'All notices': () => this.sendNotices(true),
            'Remove note': () => this.removeEntityAction('Note'),
            'Remove notice': () => this.removeEntityAction('Notice'),
            'Remove todo': () => this.removeEntityAction('Todo'),
            '/start': this.showKeyboard,
            '/menu': this.showKeyboard,
            'Close': this.closeKeyboard,
        }

        return commandHandlers[command] || (() => this.noteService.addNewNote(command))
    }

    sendNotes = async () => {
        return this.sendMessageMd(await this.noteService.getNotesMessage())
    }

    sendNotices = async (all) => {
        return this.sendMessageMd(await this.noticeService.getNoticesMessage(all))
    }

    sendTodos = async () => {
        return this.sendMessageMd(await this.todoService.getTodosMessage())
    }

    removeEntityAction = async (entityType) => {
        switch (entityType) {
            case 'Note':
                return this.sendMessageMd(await this.noteService.removeNoteAction(entityType))
            case 'Notice':
                return this.sendMessageMd(await this.noticeService.removeNoticeAction(entityType))
            case 'Todo':
                return this.sendMessageMd(await this.todoService.removeTodoAction(entityType))
        }
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
