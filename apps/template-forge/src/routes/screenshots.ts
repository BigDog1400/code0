import { Hono } from 'hono';
import { join } from 'path';
import puppeteer from 'puppeteer';
import { GeneratedComponentModel } from '../../services/component';
import fs from 'fs/promises';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const screenshot = new Hono();
const FRAMEWORKS_EXTENSION_MAP = {
  react: `tsx`,
  next: `tsx`,
  svelte: `svelte`,
  vue: `vue`,
};

const spawnProcess = (
  command: string,
  args: string[],
  workingDirectory: string,
): Promise<number> => {
  const process = spawn(command, args, { cwd: workingDirectory });

  process.stdout.on('data', (data) => {
    console.log(`${command} output:`, data.toString());
  });

  process.stderr.on('data', (data) => {
    console.error(`${command} error:`, data.toString());
  });

  return new Promise((resolve, reject) => {
    process.on('error', reject);
    process.on('close', resolve);
  });
};
const waitFor = async (fn: () => any, timeout: number) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await fn()) {
      // Added await here to ensure the function executes properly
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Timeout exceeded');
};
let serverProcess: ChildProcessWithoutNullStreams | null = null;

// Define a function that spawns the development server
const startDevServer = (workingDirectory: string): Promise<void> => {
  serverProcess = spawn('pnpm', ['dev', '--host'], {
    cwd: workingDirectory,
  });

  return new Promise<void>((resolve, reject) => {
    serverProcess!.stdout.on('data', (data) => {
      console.log('Server output:', data.toString());

      if (data.toString().includes('Network')) {
        resolve();
      }
    });

    serverProcess!.on('error', reject);
  });
};

async function generateScreenshot(generationId: string, version: string) {
  const tempFolder = join(__dirname, '../temp', generationId);
  const templateFolder = join(process.cwd(), '../../packages/shadcn_lucide');
  const componentsFolder = join(tempFolder, 'src/components/generated');

  try {
    const component = await GeneratedComponentModel.findOne({
      generationId,
      version: Number(version),
    });

    await fs.cp(templateFolder, tempFolder, { recursive: true });

    const componentMeta = {
      ...component.toJSON(),
    };

    const metaFile = join(componentsFolder, 'import.meta.ts');

    // We only need to write one component file
    const componentExtension =
      FRAMEWORKS_EXTENSION_MAP[
        (
          component.framework as keyof typeof FRAMEWORKS_EXTENSION_MAP
        ).toLowerCase()
      ];

    const componentFile = join(
      componentsFolder,
      `${component.generationId}_${component.version}.${componentExtension}`,
    );
    await fs.writeFile(componentFile, component.code);

    let importsString = `import ${componentMeta.name.trim()} from './${
      componentMeta.generationId
    }_${componentMeta.version}.${componentExtension}';\n`;
    let literal = `{ name: ${componentMeta.name.trim()}, version: '${
      componentMeta.version
    }'}`;
    importsString += `export default [${literal}]`;

    await fs.writeFile(metaFile, importsString);

    // Install dependencies
    await spawnProcess('pnpm', ['install', '.'], tempFolder);
    await startDevServer(tempFolder);

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    await waitFor(async () => {
      try {
        await page.goto(
          `http://localhost:5173/#/component/${componentMeta.version}`,
        );
        return true;
      } catch (error) {
        console.error('Navigation error:', error);
        return false;
      }
    }, 20000);
    const S3 = new S3Client({
      region: 'auto',
      endpoint: process.env.ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const cid = `${componentMeta.generationId}_${componentMeta.version}`;
    const screenshot = await page.screenshot({
      path: join(tempFolder, 'dist', `${cid}.png`),
    });

    const result = await S3.send(
      new PutObjectCommand({
        Bucket: 'code0',
        Key: `screenshots/${cid}.png`,
        Body: screenshot,
      }),
    );

    // update GeneratedComponentModel with screenshot field
    console.log(
      'Updating GeneratedComponentModel with screenshot field with cid:',
      cid,
    );
    await GeneratedComponentModel.updateOne(
      { generationId, version: Number(version) },
      { screenshot: `screenshots/${cid}.png` },
    );
    await browser.close();

    // Kill the server process
    if (serverProcess) {
      try {
        serverProcess.kill('SIGKILL');
      } catch (e) {
        console.log('error killing server process', e);
      }
    }

    return cid;
  } catch (error) {
    console.log(error);
  }
}

screenshot.post('/:generationId/:version', async (c) => {
  console.log('screenshot');
  const cid = await generateScreenshot(
    c.req.param().generationId,
    c.req.param().version,
  );
  return c.json({ cid });
});

export default screenshot;
