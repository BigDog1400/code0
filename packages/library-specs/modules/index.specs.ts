import { IGenericLibrary } from "../types.ts";
import { getDocsSpecs as getShadcnReactDocsSpecs } from './react_shadcn.specs.ts';

export const getAllDocsSpecs = (): IGenericLibrary[] => {
    return [getShadcnReactDocsSpecs()].map((e) => {
        return e
    })
}