import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import 'dotenv/config';
import { join } from 'path';
import { spawn } from 'child_process';
//@ts-ignore
import { getFilesFromPath, Web3Storage } from 'web3.storage';
import fs from 'fs/promises';
import { build } from 'vite';
import { GeneratedComponentModel } from '../services/component';
import mongoose from 'mongoose';

// await mongoose.connect(process.env.MONGODB_URI!);
(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
})();

const FRAMEWORKS_EXTENSION_MAP = {
  react: `tsx`,
  next: `tsx`,
  svelte: `svelte`,
  vue: `vue`,
};

const storage = new Web3Storage({
  token: process.env.WEB3STORAGE_TOKEN,
});

export const addComponentTemplate = async (componentId: string) => {
  const tempFolder = join(__dirname, 'temp', componentId);
  const distFolder = join(tempFolder, 'dist');
  const templateFolder = join(
    process.cwd(),
    '../../packages/templates/react/shadcn_lucide',
  );
  const componentsFolder = join(tempFolder, 'src/components/generated');

  try {
    const components = await GeneratedComponentModel.find({
      generationId: componentId,
    });

    console.log({ components });

    await fs.cp(templateFolder, tempFolder, { recursive: true });

    const componentMeta = {
      ...components[0].toJSON(),
      iterations: components,
    };

    // write meta

    const metaFile = join(componentsFolder, 'import.meta.ts');

    await fs.writeFile(
      metaFile,
      `export default ${JSON.stringify(componentMeta)}`,
    );

    // write files

    for (const component of components) {
      const componentFolder = join(
        componentsFolder,
        `${component.generationId}_${component.version}.${
          FRAMEWORKS_EXTENSION_MAP[
            (
              component.framework as keyof typeof FRAMEWORKS_EXTENSION_MAP
            ).toLowerCase()
          ]
        }`,
      );
      await fs.writeFile(componentFolder, component.code);
    }

    // Install dependencies

    const process = spawn('pnpm', ['install', '.'], { cwd: tempFolder });

    const processPromise = new Promise((resolve, reject) => {
      process.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      process.on('error', (error) => {
        reject(error);
      });
      process.on('close', (code) => {
        resolve(code);
      });
    });

    await processPromise;

    const config = (
      await import(join('file://', tempFolder, 'code0.config.js'))
    ).default;

    const configFile = config(join(tempFolder, 'src'));
    // Build template

    await build({
      ...configFile,
      root: tempFolder,
    });

    // Upload to IPFS

    console.log('Uploading to IPFS');

    let files = (await getFilesFromPath(distFolder)) as File[];
    console.log({ files });

    // for (let file of files) {
    //   // @ts-ignore
    //   file?.name = file.name.replace('/dist', '');
    // }

    files = files.map((file) => {
      // @ts-ignore
      file.name = file.name.replace('/dist', '');
      return file;
    });

    const rootCid = await storage.put(files);

    return rootCid;
  } catch (error) {
    console.log(error);
  } finally {
    // await fs.rm(tempFolder, { recursive: true });
  }
};

const app = new Hono();
app.get('/', (c) => {
  console.log(process.env.MONGODB_URI);
  return c.json({ hello: 'world' });
});

app.get('/api/forge/:generationId', async (c) => {
  const cid = await addComponentTemplate(c.req.param().generationId);
  return c.json({ cid });
});

serve(app);
