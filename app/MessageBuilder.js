module.exports = class MessageBuilder
{
    constructor(utils) {
        this.utils = utils
    }

    build = (type, data) => {
        switch (type) {
            case 'notes':
                return this.buildNotesMessage(data)
            case 'notices':
                return this.buildNoticesMessage(data)
            case 'allNotices':
                return this.buildNoticesMessage(data, true)
            case 'todos':
                return this.buildTodosMessage(data)
            case 'notice':
                return this.buildNoticeMessage(data)
            default:
                console.log('Error: invalid message type')
        }
    }

    buildNotesMessage = (notes) => {
        if (!notes.length) {
            return '* 🤷🏻‍♂️There are no notes 🤷🏻‍♂️*'
        }

        const label = '*Notes*\n\n'
        let notesMessage = ''

        for (let i = 0; i < notes.length; i++) {
            let num = i + 1
            notesMessage += `*${num}\\.* ${this.utils.escapeMarkdown(notes[i].text)}\n\n`
        }

        return label + notesMessage
    }

    buildNoticesMessage = (notices, all) => {
        if (!notices.length) {
            return '*🤷🏻‍♂️ There are no notices 🤷🏻‍♂️*'
        }

        const label = all ? '*All notices*\n\n' : '*Notices*\n\n'
        let noticesMessage = ''

        for (let notice of notices) {
            noticesMessage += `>${this.utils.escapeMarkdown(notice.datetime + '\n' + notice.text)}\n\n`
        }

        return label + noticesMessage
    }

    buildTodosMessage = (todos) => {
        if (!todos.length) {
            return '*🤷🏻‍♂️ There are no todos 🤷🏻‍♂️*'
        }

        const label = `*Todos*\n\n`
        let todosMessage = ''

        for (let todo of todos) {
            todosMessage += `${todo.is_completed ? '✔️ ' : '✖️ '} ${this.utils.escapeMarkdown(todo.text)} \n\n`
        }

        return label + todosMessage
    }

    buildNoticeMessage = (notice) => {
        if (typeof notice === 'string') {
            notice = JSON.parse(notice)
        }

        return `*Notice*\n>${this.utils.escapeMarkdown(notice.datetime)}\n\n${this.utils.escapeMarkdown(notice.text)}`
    }
}
