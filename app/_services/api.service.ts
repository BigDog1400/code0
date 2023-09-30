// This is a proxy from port 8000 which is the current server api, the idea is to port that to this in the future

import axios from "axios";

export interface ISingleComponentMetadata {
  componentId: string;
  slug: string;
  name: string;
  prompt: string;
  timestamp: Date;
  version: string;
  code: string;
  previewUrl: string;
}

export interface IComponentMetadata extends ISingleComponentMetadata {
    iterations: ISingleComponentMetadata[]
}

export const getComponentService = async (componentId: string) => {
  const { data } = await axios.get<IComponentMetadata>(`/api/${componentId}`);
  return data;
};
