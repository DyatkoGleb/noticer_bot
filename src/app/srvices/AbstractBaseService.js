const Message = require('../messages/Message')


module.exports = class AbstractBaseService
{
    constructor (noticerApi) {
        this.noticerApi = noticerApi
        this.hintTextForAddNewEntity = 'Just send me any message'

        if (new.target === AbstractBaseService) {
            throw new Error('Abstract class cannot be instantiated')
        }

        this.validateChild()
    }

    validateChild = () => {
        if (!this.getActionMethod) {
            throw new Error(`Subclass "${this.constructor.name}" must implement the getActionMethod getter, returning the appropriate data`)
        }

        if (!this.getEntityType) {
            throw new Error(`Subclass "${this.constructor.name}" must implement the getEntityType getter, returning the appropriate data`)
        }

        if (!this.getEntityMessage) {
            throw new Error(`Subclass "${this.constructor.name}" must implement the async getEntityMessage(array: entities, boolean: removing, boolean|null: getAll) method without using the arrow function`)
        }
    }

    addNew = async (message, itemType) => {
        await this.noticerApi.post('addNewNote', { message, itemType })
    }

    remove = async (entityType, id) => {
        await this.noticerApi.post(`delete${entityType}`, { id })
    }

    removeAction = async () => {
        const entities = await this.noticerApi.get(this.getActionMethod)

        if (!entities.length) {
            this.appStateManager.reset()
            return `*🤷🏻‍♂️ There are no ${this.getEntityType}s 🤷🏻‍♂️*`
        }

        this.appStateManager.setMapEntitiesNumberToId(entities.map(item => item.id))

        return await this.getEntityMessage(entities, true, true)
    }

     getHintToAddNew = () => {
        const message = new Message()
        message.setHint(this.hintTextForAddNewEntity)

        return message.getMessageText()
    }
}
