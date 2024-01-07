const Message = require('../messages/Message')
const MessageEntity = require('../messages/MessageEntity')


module.exports = class NoticeService
{
    constructor (noticerApi, appStateManager) {
        this.noticerApi = noticerApi
        this.appStateManager = appStateManager
    }

    addNewNotice = async (message) => {
        await this.noticerApi.post('addNewNote', { message, itemType: 'notice' })
    }

    removeNoticeAction = async (entityType) => {
        const notices = await this.noticerApi.get('getAllNotices')

        if (!notices.length) {
            this.appStateManager.reset()
            return '*🤷🏻‍♂️ There are no notices 🤷🏻‍♂️*'
        }

        this.appStateManager.setEntityTypeInProgressRemoving(entityType)
        this.appStateManager.setMapEntitiesNumberToId(notices.map(item => item.id))

        return await this.getNoticesMessage(true, notices, true)
    }

    getNoticesMessage = async (all, notices, removing) => {
        if (!notices) {
            notices = all
                ? await this.noticerApi.get('getAllNotices')
                : await this.noticerApi.get('getCurrentNotices')
        }

        if (!notices.length) {
            return '*🤷🏻‍♂️ There are no notices 🤷🏻‍♂️*'
        }

        const message = new Message()

        all ? message.setLabel('All notices') : message.setLabel('Notices')

        if (removing) {
            message.setHint('Send me a 0 if you are done')
        }

        notices.forEach((notice, idx) => {
            const messageEntity = new MessageEntity(notice.text)
            messageEntity.setDate(notice.datetime)
            if (removing) {
                messageEntity.setSequenceNumber(idx + 1)
            }
            message.addEntity(messageEntity)
        })

        return message.getMessageText()
    }

    getHintToAddNewNotice = (entityType) => {
        const message = new Message()
        message.setHint('Just send me message like: dd.mm.yyyy hh:mm text message')

        this.appStateManager.setEntityTypeInProgressAdding(entityType)

        return message.getMessageText()
    }

    isValidMessage = (text) => {
        const pattern = /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2} .+$/

        return pattern.test(text)
    }
}
