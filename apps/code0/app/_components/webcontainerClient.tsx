'use client';
import React, { useEffect, useCallback, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import templates from '../_templates';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useWebContainer } from '../(common-layout)/(web-container)/_atoms/web-container';
import {
  messages,
  useLoadingMessagesAtom,
} from '../(common-layout)/(web-container)/_atoms/loading-messages-atom';
import Loading from './loading-component';

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
  const [, setMessage] = useLoadingMessagesAtom();
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
      setMessage(messages[0]);
      webcontainerInstance = await WebContainer.boot();
      setWebContainerInstance(webcontainerInstance);
      window.webContainer = webcontainerInstance;
      setWebContainerStatus('booted');

      setMessage(messages[1]);
      await webcontainerInstance.mount(templates.react[0].template);

      setMessage(messages[2]);
      const exitCode = await installDependencies();
      if (exitCode !== 0) {
        throw new Error('Installation failed');
      }

      setMessage(messages[3]);
      await startDevServer();

      getComponentCodeFiles();
    },
    [getComponentCodeFiles, setWebContainerInstance, setMessage],
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
    <div className="preview w-full min-h-full flex flex-col relative">
      <Loading />
      <iframe className="w-full h-full flex-1" src="/loading"></iframe>
    </div>
  );
}
