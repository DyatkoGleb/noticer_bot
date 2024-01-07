const Message = require('../messages/Message')
const MessageEntity = require('../messages/MessageEntity')
const AbstractBaseService = require('./AbstractBaseService')


module.exports = class NoteService extends AbstractBaseService
{
    constructor (noticerApi, appStateManager) {
        super(noticerApi)
        this.appStateManager = appStateManager
    }

    get getActionMethod() {
        return 'getNotes'
    }

    get getEntityType() {
        return 'note'
    }

    async getEntityMessage (notes, removing) {
        notes = notes ?? await this.noticerApi.get('getNotes')

        if (!notes.length) {
            return '*🤷🏻‍♂️ There are no notes 🤷🏻‍♂️*'
        }

        const message = new Message()

        message.setLabel('Notes')

        if (removing) {
            message.setHint('Send me a 0 if you are done')
        }

        notes.forEach((note, idx) => {
            const messageEntity= new MessageEntity(note.text)
            messageEntity.setSequenceNumber(idx + 1)
            message.addEntity(messageEntity)
        })

        return message.getMessageText()
    }
}
