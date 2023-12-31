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
import screenshot from './routes/screenshots';
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
  token: process.env.WEB3STORAGE_TOKEN!,
});

export const addComponentTemplate = async (componentId: string) => {
  const tempFolder = join(__dirname, 'temp', componentId);
  const distFolder = join(tempFolder, 'dist');
  const templateFolder = join(process.cwd(), '../../packages/shadcn_lucide');
  const componentsFolder = join(tempFolder, 'src/components/generated');

  try {
    const components = await GeneratedComponentModel.find({
      generationId: componentId,
    });

    // console.log({ components });

    await fs.cp(templateFolder, tempFolder, { recursive: true });

    const componentMeta = {
      ...components[0].toJSON(),
      iterations: components,
    };

    // write meta

    const metaFile = join(componentsFolder, 'import.meta.ts');

    // write files

    const chunkNames: Array<{
      name: string;
      import: string;
      version: string;
    }> = [];
    for (const component of components) {
      const componentExtension =
        FRAMEWORKS_EXTENSION_MAP[
          (
            component.framework as keyof typeof FRAMEWORKS_EXTENSION_MAP
          ).toLowerCase()
        ];
      // console.log({ componentExtension });
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

      chunkNames.push({
        name: `${component.name}_${component.version}`,
        import: `./${component.generationId}_${component.version}.${componentExtension}`,
        version: component.version,
      });

      // console.log(componentFolder);

      await fs.writeFile(componentFolder, component.code);
    }

    let literal = ``;
    let importsString = '';
    for (const chunkName of chunkNames) {
      const importStatement = `import ${chunkName.name} from '${chunkName.import}';\n`;
      importsString += importStatement;

      literal += `{
        name: ${chunkName.name},
        version: "${chunkName.version}",
      },\n`;
    }

    importsString += `export default [${literal}];`;

    await fs.writeFile(metaFile, importsString);

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

    // const viteConfig = (
    //   await import(join('file://', tempFolder, 'code0.config.js'))
    // ).default;

    // Build
    // defineConfig({
    //   plugins: [react()],
    //   resolve: {
    //     alias: {
    //       '@': resolve(__dirname, './src'),
    //     },
    //   },
    // })
    // const buildResult = await build({
    //   root: tempFolder,
    //   plugins: [rrea
    // });

    // calling build.js directly

    // const buildProcess = spawn('node', ['build.js'], { cwd: tempFolder });

    // Execute build.js script that is in the template folder. It has a buildPackage function
    // that is async and returns a promise. We wait for that promise to resolve before continuing
    // with the rest of the script.
    const buildProcess = spawn('node', ['build.js'], { cwd: tempFolder });
    const buildProcessPromise = new Promise((resolve, reject) => {
      buildProcess.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      buildProcess.on('error', (error) => {
        reject(error);
      });
      buildProcess.on('close', async (code) => {
        console.log('Build process closed');
        let files = (await getFilesFromPath(distFolder)) as File[];

        files = files.map((file) => {
          // @ts-ignore
          file.name = file.name.replace('/dist', '');
          return file;
        });

        const rootCid = await storage.put(files);

        console.log('Root CID', rootCid);

        return rootCid;
        resolve(code);
      });
    });

    // Upload to IPFS

    console.log('Uploading to IPFS');
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

app.route('/api/screenshot', screenshot);

serve({
  fetch: app.fetch,
  port: 8787,
});
