export interface ResourceId {
  "@id"?: string;
  id?: number | string;
}

export interface ResourceIdStore {
  setData: (data: ResourceId) => void
}