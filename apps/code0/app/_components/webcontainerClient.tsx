'use client';
import React, { useEffect, useCallback, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import templates from '../_templates';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useWebContainer } from '../(common-layout)/(web-container)/_atoms/web-container';

// /** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance: WebContainer;

async function installDependencies() {
  // Install dependencies
  const installProcess = await webcontainerInstance!.spawn('pnpm', ['install']);

  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log(data);
      },
    }),
  );

  // Wait for install command to exit
  return installProcess.exit;
}

async function startDevServer() {
  const iframeEl = document.querySelector('iframe')!;
  // Run `npm run start` to start the Express app
  await webcontainerInstance!.spawn('pnpm', ['run', 'dev']);

  // Wait for `server-ready` event
  webcontainerInstance!.on('server-ready', (port, url) => {
    iframeEl.src = url;
  });
}

export function WebContainerClient() {
  const [webContainerInstance, setWebContainerInstance] = useWebContainer();
  const { ['component-id']: componentId } = useParams();
  const [webContainerStatus, setWebContainerStatus] = useState<
    'loading' | 'booted' | 'error' | 'idle'
  >('idle');

  const loadFiles = useCallback(async (componentMetadata: any) => {
    const metadata = {
      ...componentMetadata,
      extension: 'tsx',
    };
    // debugger;
    console.log('componentMetadata', componentMetadata);
    console.log('metadata', metadata);
    console.log(
      'Path inside loadFiles:',
      `/src/components/generated/${componentMetadata.generationId}_${componentMetadata.version}.${metadata.extension}`,
    );
    await window.webContainer?.fs.writeFile(
      `/src/components/generated/${metadata.generationId}_${metadata.version}.${metadata.extension}`,
      metadata.code,
    );
    await window.webContainer?.fs.writeFile(
      `/src/components/generated/import.meta.ts`,
      `export default ${JSON.stringify(metadata)}`,
    );
  }, []);

  const getComponentCodeFiles = useCallback(async () => {
    if (!componentId) {
      return;
    }
    const { data } = await axios.get(`/api/components/${componentId}`);
    loadFiles(data);
  }, [componentId, loadFiles]);

  const bootWebContainer = useCallback(
    async (componentId: string) => {
      setWebContainerStatus('loading');
      webcontainerInstance = await WebContainer.boot();
      setWebContainerInstance(webcontainerInstance);
      window.webContainer = webcontainerInstance;
      setWebContainerStatus('booted');

      await webcontainerInstance.mount(templates.react[0].template);

      const exitCode = await installDependencies();
      if (exitCode !== 0) {
        throw new Error('Installation failed');
      }

      await startDevServer();

      getComponentCodeFiles();
    },
    [getComponentCodeFiles, setWebContainerInstance],
  );

  useEffect(() => {
    if (window.webContainer) {
      setWebContainerInstance(window.webContainer);
      getComponentCodeFiles();
    } else {
      if (webContainerStatus === 'loading') {
        return;
      }
      bootWebContainer(componentId as string);
    }
  }, [
    componentId,
    webContainerStatus,
    bootWebContainer,
    getComponentCodeFiles,
    setWebContainerInstance,
    setWebContainerStatus,
  ]);

  return (
    <div className="preview">
      <iframe src="/loading"></iframe>
    </div>
  );
}
