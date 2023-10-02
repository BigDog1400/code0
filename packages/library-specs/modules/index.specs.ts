import { IGenericLibrary } from "../types.ts";
import { getDocsSpecs as getShadcnReactDocsSpecs } from "./react_shadcn.specs.ts";
import { getDocsSpecs as getCrakraVueDocsSpecs } from "./vue_chakra.specs.ts";

export const getAllDocsSpecs = (): IGenericLibrary[] => {
  return [getShadcnReactDocsSpecs(), getCrakraVueDocsSpecs()].map((e) => {
    return e;
  });
};
