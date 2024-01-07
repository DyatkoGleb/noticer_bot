module.exports = class AppStateManager
{
    constructor () {
        this.entityInProgressRemoving = ''
        this.inProgressRemoving = false
    }

    setEntityTypeInProgressRemoving = (entityInProgressRemoving) => {
        this.entityInProgressRemoving = entityInProgressRemoving
    }

    getEntityTypeInProgressRemoving = () => {
        return this.entityInProgressRemoving
    }

    setInProgressRemoving = (inProgressRemoving) => {
        this.inProgressRemoving = inProgressRemoving
    }

    getInProgressRemoving = () => {
        return this.inProgressRemoving
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

    reset() {
        this.entityInProgressRemoving = ''
        this.inProgressRemoving = false
        this.mapEntitiesNumberToId = null
    }
}