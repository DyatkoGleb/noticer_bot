module.exports = class AppStateManager
{
    constructor () {
        this.entityInProgressRemoving = ''
        this.entityInProgressAdding = ''
        this.serviceInProcessing = null
        this.mapEntitiesNumberToId = null
    }

    setEntityTypeInProgressRemoving = (entityInProgressRemoving) => {
        this.entityInProgressRemoving = entityInProgressRemoving
    }

    getEntityTypeInProgressRemoving = () => {
        return this.entityInProgressRemoving
    }

    setEntityTypeInProgressAdding = (entityInProgressAdding) => {
        this.entityInProgressAdding = entityInProgressAdding
    }

    getEntityTypeInProgressAdding = () => {
        return this.entityInProgressAdding
    }

    setServiceInProcessing = (serviceInProcessing) => {
        this.serviceInProcessing = serviceInProcessing
    }

    getServiceInProcessing = () => {
        return this.serviceInProcessing
    }

    setMapEntitiesNumberToId = (entityIds) => {
        this.mapEntitiesNumberToId = entityIds.reduce((acc, entityId, i) => {
            acc[i + 1] = entityId
            return acc
        }, {})
    }

    getMapEntitiesNumberToId = () => {
        return this.mapEntitiesNumberToId
    }

    removeFieldFromMapEntitiesNumberToId = (number) => {
        delete this.mapEntitiesNumberToId[number]
    }

    reset() {
        this.entityInProgressRemoving = ''
        this.entityInProgressAdding = ''
        this.serviceInProcessing = null
        this.mapEntitiesNumberToId = null
    }
}