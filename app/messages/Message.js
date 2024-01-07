const Utils = require('../Utils')


module.exports = class Message {
    constructor (text) {
        this.utils = new Utils()
        this.entities = []

        this.text = text ? this.utils.escapeMarkdown(text) : ''
    }

    setLabel = (label) => {
        this.label = '*' + this.utils.escapeMarkdown(label) + '*'
    }

    getLabel = () => {
        return this.label
    }

    setHint = (hint) => {
        this.hint = '_' + this.utils.escapeMarkdown(hint) + '_'
    }

    getHint = () => {
        return this.hint
    }

    addEntity = (entity) => {
        this.entities.push(entity)
    }

    getMessageText = () => {
        const entitiesText = this.entities.reduce((messageText, entity, i) => {
            if (entity.getDate()) {
                messageText += '>' + entity.getDate() + '\n'
            }

            if (entity.getSequenceNumber()) {
                messageText += entity.getSequenceNumber() + '\\. '
            }

            if (typeof entity.getIsCompleted() === 'boolean') {
                messageText += entity.getIsCompleted() ? '✔️ ' : '✖️ '
            }

            return messageText + entity.getText() + '\n\n'
        }, '')

        const label = this.getLabel() ? this.getLabel() + '\n\n' : ''
        const hint = this.getHint() ? this.getHint() + '\n\n' : ''

        console.log(label + hint + this.text + entitiesText)

        return label + hint + this.text + entitiesText
    }
}