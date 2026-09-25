import type { Store } from "pinia";

export interface ResourceId {
  "@id"?: string;
  id?: number | string;
}

export interface ResourceIdStore {
  setData: (data: ResourceId) => void
}

export type ResourceIdStoreInstance = Store<string, ResourceId> & ResourceIdStore