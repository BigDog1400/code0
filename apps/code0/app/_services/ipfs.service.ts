// import { join } from 'path';
// import { spawn } from 'child_process';
// //@ts-ignore
// import { getFilesFromPath, Web3Storage } from 'web3.storage';
// import fs from 'fs/promises';
// import { GeneratedComponentModel } from '../_models/component';
// import { build } from 'vite'

// const storage = new Web3Storage({
//   token: process.env.WEB3STORAGE_TOKEN,
// });

export const addComponentTemplate = async (componentId: string) => {
  // const tempFolder = join(__dirname, 'temp', componentId);
  // const distFolder = join(tempFolder, 'dist');
  // const templateFolder = join(
  //   process.cwd(),
  //   '../../packages/templates/react/shadcn_lucide',
  // );
  // const componentsFolder = join(tempFolder, 'src/components/generated');

  // try {
  //   const components = await GeneratedComponentModel.find({
  //     generationId: componentId,
  //   });

  //   await fs.cp(templateFolder, tempFolder, { recursive: true });

  //   const componentMeta = {
  //     ...components[0].toJSON(),
  //     iterations: components,
  //   };

  //   // write meta

  //   const metaFile = join(componentsFolder, 'import.meta.ts');

  //   await fs.writeFile(
  //     metaFile,
  //     `export default ${JSON.stringify(componentMeta)}`,
  //   );

  //   // write files

  //   for (const component of components) {
  //     const componentFolder = join(componentsFolder, `${component.generationId}_${component.version}`);
  //     await fs.writeFile(
  //         componentFolder,
  //         component.code
  //     )
  //   }

  //   // Install dependencies

  //   const process = spawn('pnpm', ['install', '.'], { cwd: tempFolder });

  //   const processPromise = new Promise((resolve, reject) => {
  //     process.stdout.on('data', (data) => {
  //       console.log(data.toString());
  //     });
  //     process.on('error', (error) => {
  //       reject(error);
  //     });
  //     process.on('close', (code) => {
  //       resolve(code);
  //     });
  //   })

  //   await processPromise;

  //   const config = (await import(join(tempFolder, 'vite.config.js'))).default

  //   const configFile = config(join(tempFolder, 'src'));
  //   // Build template

  //   await build({
  //     ...configFile,
  //     root: tempFolder,
  //   })

  //   // Upload to IPFS

  //   const files = (await getFilesFromPath(distFolder)) as File[];

  //   const rootCid = await storage.put(files);

  //   return rootCid;
  // } catch (error) {
  //   console.log(error);
  // } finally {
  //   // await fs.rm(tempFolder, { recursive: true });
  // }
};
