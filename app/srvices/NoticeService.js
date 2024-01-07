const Message = require('../messages/Message')
const MessageEntity = require('../messages/MessageEntity')
const AbstractBaseService = require('./AbstractBaseService')


module.exports = class NoticeService extends AbstractBaseService
{
    constructor (noticerApi, appStateManager) {
        super(noticerApi)
        this.appStateManager = appStateManager
        this.hintTextForAddNewEntity = 'Just send me message like: dd.mm.yyyy hh:mm text message'
    }

    get getActionMethod() {
        return 'getAllNotices'
    }

    get getEntityType() {
        return 'notice'
    }

    async getEntityMessage (notices, removing, getAll) {
        if (!notices) {
            notices = getAll
                ? await this.noticerApi.get('getAllNotices')
                : await this.noticerApi.get('getCurrentNotices')
        }

        if (!notices.length) {
            return '*🤷🏻‍♂️ There are no notices 🤷🏻‍♂️*'
        }

        const message = new Message()

        getAll ? message.setLabel('All notices') : message.setLabel('Notices')

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

    isValidMessage = (text) => {
        const pattern = /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2} .+$/

        return pattern.test(text)
    }
}
