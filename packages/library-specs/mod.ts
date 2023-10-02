import "https://deno.land/std@0.202.0/dotenv/load.ts";
import { getAllDocsSpecs } from "./modules/index.specs.ts";
import {
  AllowedFramework,
  IGenericLibrary,
  IGenericLibraryWithSpecs,
  LibraryCollection,
} from "./types.ts";
import { connect } from "npm:mongoose";
import { GenericLibraryModel } from "./models/bulk.model.ts";
import { ensureDir } from "https://deno.land/std@0.202.0/fs/ensure_dir.ts";
import { join, dirname } from "https://deno.land/std@0.202.0/path/mod.ts";
import * as zip from "https://deno.land/x/zipjs@v2.7.29/index.js";
import axios from "npm:axios";

const MONGO_URI = Deno.env.get("MONGO_URI") || "";

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
};

const unzip = async (bufferAsset: Uint8Array, dest: string) => {
  const reader = new zip.ZipReader(new zip.Uint8ArrayReader(bufferAsset));
  const entries = await reader.getEntries();
  const entriesPromises = entries.map(async (entry) => {
    if (entry) {
      const data = await entry.getData?.(new zip.Uint8ArrayWriter());
      const root = join("./clones", dest);
      const fileroot = entry.filename.split("/")[0];
      const filename = join(root, entry.filename.replace(fileroot, ""));
      if (data) {
        if (entry.directory) {
          await Deno.mkdir(filename, { recursive: true });
        } else {
          const _dirname = dirname(filename);
          await ensureDir(_dirname);
          await Deno.writeFile(filename, data);
        }
      }
    }
  });
  await Promise.all(entriesPromises);
  reader.close();
};

export const downloadCommand = async (dest?: string, url?: string, branch?: string) => {
  if (!dest || !url) {
    return;
  }
  console.log(`Cloning ${url}/refs/heads/${branch || "main"}.zip into ./clones/${dest}`);
  const { data } = await axios.get(`${url}/archive/refs/heads/${branch || "main"}.zip`, {
    responseType: "arraybuffer",
  });
  const path = join(Deno.cwd(), `./clones/${dest}.zip`);
  ensureDir(dirname(path));
  await Deno.writeFile(path, data);
  console.log("Extracting...");
  const zip = await Deno.readFile(path);
  await unzip(zip, dest);
  await Deno.remove(path);
  if (dest) {
    await Deno.rename("openv0-main", dest);
  }
};

const cloneLibraries = async (libraries: IGenericLibrary[]) => {
  const promises = libraries.map(async (library) => {
    await downloadCommand(library.clone?.path, library.clone?.repo);
  });
  await Promise.allSettled(promises);
};

const mainTask = async () => {
  await connect(MONGO_URI);
  await ensureDir("./clones");
  await Deno.remove("./clones", { recursive: true });
  const specs = getAllDocsSpecs();
  await cloneLibraries(specs);
  const updatedSpecs = (
    await Promise.allSettled(
      specs.map(async (e) => {
        return {
          ...e,
          specs: await e.specs(),
        };
      })
    )
  )
    .filter((e) => e.status === "fulfilled")
    .map((e) => (e as PromiseFulfilledResult<IGenericLibraryWithSpecs>).value);
  await GenericLibraryModel.insertMany(updatedSpecs);
};

await mainTask();

console.log(await getFormatteSpecsFromDb());
