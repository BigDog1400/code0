export type AllowedFramework = "react" | "vue" | "svelte";

export interface IGenericLibraryExample {
  source: string;
  code: string;
}

export interface IGenericLibraryDocs {
  import: IGenericLibraryExample;
  use: IGenericLibraryExample[];
  examples: IGenericLibraryExample[];
}

export interface IGenericLibrarySpec {
  name: string;
  description: string;
  docs_path: string;
  docs: IGenericLibraryDocs;
}

export interface IGenericLibraryClone {
  path: string;
  repo: string;
  branch?: string;
}

export interface IGenericLibrary {
  clone?: IGenericLibraryClone;
  framework: AllowedFramework;
  library: string;
  specs: () => Promise<IGenericLibrarySpec[]>;
}

export interface IGenericLibraryWithSpecs extends Omit<IGenericLibrary, "specs"> {
  specs: IGenericLibrarySpec[];
}

export type LibraryCollection = {
  [key in AllowedFramework]?: {
    library: string;
    specs: IGenericLibrarySpec[];
  }[];
}
