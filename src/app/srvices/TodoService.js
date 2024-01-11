const Message = require('../messages/Message')
const MessageEntity = require('../messages/MessageEntity')
const AbstractBaseService = require('./AbstractBaseService')


module.exports = class TodoService extends AbstractBaseService
{
    constructor (noticerApi, appStateManager) {
        super(noticerApi)
        this.appStateManager = appStateManager
    }

    get getActionMethod() {
        return 'getTodos'
    }

    get getEntityType() {
        return 'todo'
    }

    async getEntityMessage (todos, removing) {
        todos = todos ?? await this.noticerApi.get('getTodos')

        if (!todos.length) {
            return '*🤷🏻‍♂️ There are no todos 🤷🏻‍♂️*'
        }

        const message = new Message()

        message.setLabel('Todos')

        if (removing) {
            message.setHint('Send me a 0 if you are done')
        }

        todos.forEach((todo, idx) => {
            const messageEntity= new MessageEntity(todo.text)
            messageEntity.setIsCompleted(todo.is_completed)
            if (removing) {
                messageEntity.setSequenceNumber(idx + 1)
            }
            message.addEntity(messageEntity)
        })

        return message.getMessageText()
    }
}
