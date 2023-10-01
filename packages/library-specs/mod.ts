import "https://deno.land/std@0.202.0/dotenv/load.ts";
import { getAllDocsSpecs } from "./modules/index.specs.ts";
import { AllowedFramework, IGenericLibrary, LibraryCollection } from "./types.ts";
import { connect } from "npm:mongoose";
import { GenericLibraryModel } from "./models/bulk.model.ts";

const MONGO_URI = Deno.env.get("MONGO_URI") || "";

export const getFormatteSpecsFromFs = async () => {
  const docsSpecs = await Promise.allSettled(getAllDocsSpecs());
  const docsSpecsFiltered = docsSpecs
    .filter((e) => e.status === "fulfilled")
    .map((e) => (e as PromiseFulfilledResult<IGenericLibrary>).value)
    .reduce((a, b) => {
      const framework = b.framework;
      return {
        ...a,
        [framework]: [
          ...(a[framework] || []),
          { library: b.library, specs: b.specs },
        ],
      };
    }, {} as unknown as LibraryCollection);

  return docsSpecsFiltered;
};

const getFormatteSpecsFromDb = async () => {
  const docsSpecs = await GenericLibraryModel.find();
  const docsSpecsFiltered = docsSpecs.reduce((a, b) => {
    const framework = b.framework;
    return {
      ...a,
      [framework as unknown as string]: [
        ...(a[framework as unknown as AllowedFramework] || []),
        { library: b.library, specs: b.specs },
      ],
    };
  }, {} as unknown as LibraryCollection);

  return docsSpecsFiltered;
}

const bulkSpecsToDabase = async () => {
  const docsSpecs = await Promise.allSettled(getAllDocsSpecs());
  await GenericLibraryModel.insertMany(docsSpecs.filter((e) => e.status === "fulfilled").map((e) => (e as PromiseFulfilledResult<IGenericLibrary>).value));
};

await connect(MONGO_URI);

await bulkSpecsToDabase();

console.log(await getFormatteSpecsFromDb());