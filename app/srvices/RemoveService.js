module.exports = class RemoveService
{
    constructor (noticerApi) {
        this.noticerApi = noticerApi
    }

    removeEntity = async (entityType, entityId) => {
        await this.noticerApi.post(`delete${entityType}`, { id: entityId })
    }
}
