import type { CollectionStoreInstance } from "./collection";
import type { ContactInformationStoreInstance } from "./contactInformation";
import type { ErrorsStoreInstance, IError } from "./error";
import type { IdentityStoreInstance } from "./identity";
import type { ResourceIdStoreInstance } from "./resourceId";
import type { WebUserStoreInstance } from "./webuser";


export declare const useCollectionStore: (id?: string) => CollectionStoreInstance;
export declare const useContactInformationStore: (id: string) => ContactInformationStoreInstance;
export declare const useErrorsStore: <TError extends IError = IError>(id: string) => ErrorsStoreInstance<TError>;
export declare const useIdentityStore: (id: string) => IdentityStoreInstance;
export declare const useResourceIdStore: (id: string) => ResourceIdStoreInstance;
export declare const useWebUserStore: (id?: string) => WebUserStoreInstance;
