'use client';
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import templates from '../_templates';
import axios from 'axios';
import { useParams, useSearchParams } from 'next/navigation';
import { useWebContainer } from '../(common-layout)/(web-container)/_atoms/web-container';
import {
  messages,
  useLoadingMessagesAtom,
} from '../(common-layout)/(web-container)/_atoms/loading-messages-atom';
import Loading from './loading-component';
import html2canvas from 'html2canvas';
import {
  GeneratedComponentBase,
  GeneratedComponentMetadata,
} from '../_models/component';

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

async function startDevServer(defaultComponent: GeneratedComponentBase) {
  const iframeEl = document.querySelector('iframe')!;
  // Run `npm run start` to start the Express app
  await webcontainerInstance!.spawn('pnpm', ['run', 'dev']);

  // Wait for `server-ready` event
  webcontainerInstance!.on('server-ready', (port, url) => {
    iframeEl.src = `${url}/#/component/${defaultComponent.version}`;
  });
}

export function WebContainerClient({
  componentData,
}: {
  componentData: GeneratedComponentMetadata;
}) {
  const params = useSearchParams();
  const version = params.get('version') || componentData.iterations[0].version;
  const [webContainerInstance, setWebContainerInstance] = useWebContainer();
  const [, setMessage] = useLoadingMessagesAtom();
  const { ['component-id']: componentId } = useParams();
  const [loadedStatus, setLoadedStatus] = useState<'loading' | 'loaded'>(
    'loading',
  );

  useEffect(() => {
    console.log({ loadedStatus });
    console.log({ version });
    if (loadedStatus !== 'loaded') {
      return;
    }
    const iframeEl = document.querySelector('iframe')!;
    // Read the iframe src domain and just change the path to /#/component/${componentVersion}
    const url = new URL(iframeEl.src);
    iframeEl.src = `${url.origin}/#/component/${version}`;
  }, [version, loadedStatus]);

  const iframeRef = useRef<HTMLDivElement>(null);

  // we need to add a postMessage event in the iframe to tell the parent that the component is loaded
  useEffect(() => {
    window.addEventListener('message', (message) => {
      console.log({ message });
      const { data } = message;

      if (data && data === 'component-loaded') {
        setLoadedStatus('loaded');
      }
    });
    console.log(componentData);
  }, []);

  const [webContainerStatus, setWebContainerStatus] = useState<
    'loading' | 'booted' | 'error' | 'idle'
  >('idle');

  const loadFiles = useCallback(
    async (componentMetadata: GeneratedComponentMetadata) => {
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
    },
    [],
  );

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
      const defaultComponentData = componentData.iterations.find(
        (component) => component.version === Number(version),
      );
      await startDevServer(defaultComponentData!);

      loadFiles(componentData);
    },
    [setWebContainerInstance, setMessage, version, componentData, loadFiles],
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
      className="relative flex flex-col w-full min-h-full preview"
    >
      <Loading />
      <iframe
        name="preview"
        className="flex-1 w-full h-full"
        src="/loading"
      ></iframe>
    </div>
  );
}
