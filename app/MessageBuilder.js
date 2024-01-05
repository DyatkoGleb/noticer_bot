const Utils = require('./Utils')

class MessageBuilder
{
    build = (type, data) => {
        switch (type) {
            case 'notes':
                return this.buildNotesMessage(data)
            case 'notices':
                return this.buildNoticesMessage(data)
            case 'todos':
                return this.buildTodosMessage(data)
            case 'notice':
                return this.buildNoticeMessage(data)
            default :
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
            notesMessage += `*${num}\\.* ${Utils.escapeMarkdown(notes[i].text)}\n\n`
        }

        return label + notesMessage
    }

    buildNoticesMessage = (notices) => {
        if (!notices.length) {
            return '*🤷🏻‍♂️ There are no notices 🤷🏻‍♂️*'
        }

        const label = '*Notices*\n\n'
        let noticesMessage = ''

        for (let notice of notices) {
            noticesMessage += `>${Utils.escapeMarkdown(notice.datetime + '\n' + notice.text)}\n\n`
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
            todosMessage += `${todo.is_completed ? '✔️ ' : '✖️ '} ${Utils.escapeMarkdown(todo.text)} \n\n`
        }

        return label + todosMessage
    }

    buildNoticeMessage = (notice) => {
        if (typeof notice === 'string') {
            notice = JSON.parse(notice)
        }

        return `*Notice*\n>${Utils.escapeMarkdown(notice.datetime)}\n\n${Utils.escapeMarkdown(notice.text)}`
    }
}


module.exports = new MessageBuilder()