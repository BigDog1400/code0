export type AllowedFramework = "react" | "vue" | "svelte";

export interface IGenericLibraryExample {
  source: string;
  code: string;
}

export interface IGenericLibraryDocs {
  title: string;
  description: string;
  component: boolean;
}

export interface IGenericLibrarySpec {
  name: string;
  description: string;
  docs_path: string;
  docs: IGenericLibraryDocs;
  examples: IGenericLibraryExample[];
}

export interface IGenericLibraryClone {
  name: string;
  repo: string;
}

export interface IGenericLibrary {
  clone?: string;
  framework: AllowedFramework;
  library: string;
  specs: IGenericLibrarySpec[];
}

export type LibraryCollection = {
  [key in AllowedFramework]?: {
    library: string;
    specs: IGenericLibrarySpec[];
  }[];
}
