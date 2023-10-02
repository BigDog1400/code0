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
