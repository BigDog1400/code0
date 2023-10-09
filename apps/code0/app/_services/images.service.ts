import puppeteer from 'puppeteer';
import { File, Blob } from '@web-std/file';
//@ts-ignore
import { Web3Storage } from 'web3.storage';
import sharp from 'sharp';
import { GeneratedComponentModel } from '../_models/component';

const storage = new Web3Storage({
  token: process.env.WEB3STORAGE_TOKEN,
});

export const generateComponentPreview = async (
  componentId: string,
  componentVersion?: number,
) => {
  const browser = await puppeteer.launch(); // if it is serverless we should use browserless.io or some idk

  console.log('navigating');

  const page = await browser.newPage();
  await page.goto(
    `http://localhost:3000/generated/${componentId}${
      componentVersion ? `?componentVersion=${componentVersion}` : ''
    }`,
  );

  const iframeHandle = (await page.frames()).find(
    (frame) => frame.name() === 'topLevelIframeName'
  ); // Replace with the actual CSS selector of the iframe

  if (iframeHandle) {
    // Wait for an element inside the iframe to appear
    await iframeHandle.waitForSelector('#root', {
      timeout: 120000,
    }); // Replace with the actual selector of an element inside the iframe

    // Get the bounding box of the iframe


      // Capture a screenshot of the iframe's contents
      //@ts-ignore
      const image = (await iframeHandle.screenshot({
        encoding: 'binary',
      })) as Buffer;

      await browser.close();

      console.log('Processing');

      // Post process

      const imageMetadata = await sharp(image).metadata();
      const imagex1 = await sharp(image)
        .resize(
          Math.round(imageMetadata.width! / 2),
          Math.round(imageMetadata.height! / 2),
        )
        .webp()
        .toBuffer();

      const filename = `${componentId}${
        componentVersion ? `v${componentVersion}` : ''
      }.webp`;

      console.log('Uploading');

      const blob = new Blob([imagex1], { type: 'image/webp' });
      const files = [new File([blob], filename)];
      const cid = await storage.put(files);

      const url = `/api/preview/gateway/${cid}/${filename}`;

      await GeneratedComponentModel.findOneAndUpdate(
        { generationId: componentId },
        { preview: url },
        { new: true },
      );
      
  }
};
