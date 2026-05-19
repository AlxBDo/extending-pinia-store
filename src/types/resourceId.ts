export interface ResourceId {
  "@id"?: string;
  id?: number;
}

export interface ResourceIdStore {
  setData: (data: ResourceId) => void
}