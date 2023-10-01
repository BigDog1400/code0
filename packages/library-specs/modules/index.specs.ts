import { IGenericLibrary } from "../types.ts";
import { getDocsSpecs as getShadcnReactDocsSpecs } from './react_shadcn.specs.ts';

export const getAllDocsSpecs = (): Promise<IGenericLibrary>[] => {
    return [getShadcnReactDocsSpecs()].map(async (e) => {
        return await e
    })
}