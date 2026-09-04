import ExtendsPiniaStore from '../plugins/ExtendsPiniaStore'
import ParentStore from '../plugins/parentStore'


export { createParentStore } from '../utils/parentStoreFactory'
export { ExtendsPiniaStore }
export { getExtendingStore } from '../utils/store'
export { ParentStore }
export { pluginName as PLUGIN_NAME } from '../utils/constantes'

/**
 * Stores
 */
export { useCollectionStore } from '../stores/collection'
export { useContactInformationStore } from '../stores/contactInformation'
export { useErrorsStore } from '../stores/errors'
export { useIdentityStore } from '../stores/identity'
export { useResourceIdStore } from '../stores/resourceId'
export { useWebUserStore } from '../stores/webuser'