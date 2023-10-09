'use client';
import React, { useEffect, useCallback, useState, useRef } from 'react';
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
import html2canvas from 'html2canvas';
import { GeneratedComponent, GeneratedComponentMetadata } from '../_models/component';

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

async function startDevServer(defaultComponent: GeneratedComponent) {
  const iframeEl = document.querySelector('iframe')!;
  // Run `npm run start` to start the Express app
  await webcontainerInstance!.spawn('pnpm', ['run', 'dev']);

  // Wait for `server-ready` event
  webcontainerInstance!.on('server-ready', (port, url) => {
    iframeEl.src = `${url}/#/component/${defaultComponent.version}`;
  });
}

export function WebContainerClient({ componentData }:{ componentData: GeneratedComponentMetadata }) {
  const [webContainerInstance, setWebContainerInstance] = useWebContainer();
  const [, setMessage] = useLoadingMessagesAtom();
  const { ['component-id']: componentId } = useParams();
  const [loadedStatus, setLoadedStatus] = useState<'loading' | 'loaded'>(
    'loading',
  );

  const iframeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.addEventListener('message', (message) => {
      const { data } = message;
      if (data && data === 'component-loaded') {
        setLoadedStatus('loaded');
      }
    });
    console.log(componentData)
  }, []);

  const [webContainerStatus, setWebContainerStatus] = useState<
    'loading' | 'booted' | 'error' | 'idle'
  >('idle');

  const loadFiles = useCallback(async (componentMetadata: GeneratedComponentMetadata) => {
    const metadata = {
      ...componentMetadata,
      extension: 'tsx',
    };

    for (const component of componentMetadata.iterations) {
      await window.webContainer?.fs.writeFile(
        `/src/components/generated/${component.generationId}_${component.version}.${metadata.extension}`,
        component.code,
      );
    }

    await window.webContainer?.fs.writeFile(
      `/src/components/generated/import.meta.ts`,
      `export default ${JSON.stringify(metadata)}`,
    );
  }, []);

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
      await startDevServer({ ...componentData }.iterations.pop()!);

      loadFiles(componentData);
    },
    [setWebContainerInstance, setMessage],
  );

  useEffect(() => {
    if (window.webContainer) {
      setWebContainerInstance(window.webContainer);
      loadFiles(componentData);
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
    setWebContainerInstance,
    setWebContainerStatus,
  ]);

  useEffect(() => {
    if (loadedStatus === 'loaded') {
      setMessage(messages[messages.length - 1]);
    }
  }, [loadedStatus]);

  return (
    <div
      ref={iframeRef}
      className="preview w-full min-h-full flex flex-col relative"
    >
      <Loading />
      <iframe
        name="preview"
        className="w-full h-full flex-1"
        src="/loading"
      ></iframe>
    </div>
  );
}
